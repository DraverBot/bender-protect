import {
    ChannelType,
    CommandInteraction,
    EmbedBuilder,
    GuildBasedChannel,
    GuildChannel,
    MessageCreateOptions,
    TextChannel,
    User
} from 'discord.js';
import { Process } from '../structures/Process';
import { askChannel, invalidChannel, invalidChannelType } from '../utils/embeds';
import { sendAndDelete, systemReply } from '../utils/toolbox';
import { log4js } from 'amethystjs';

export default new Process(
    'get channel',
    async ({
        interaction,
        user,
        time = 120000,
        embed = askChannel(user),
        channelTypes = [],
        checks = []
    }: {
        interaction: CommandInteraction;
        user: User;
        embed?: EmbedBuilder;
        time?: number;
        channelTypes?: ChannelType[];
        checks?: { check: (c: GuildBasedChannel | User) => boolean; reply: MessageCreateOptions }[];
    }) => {
        return new Promise<'cancel' | "time's up" | GuildChannel>(async (resolve) => {
            await systemReply(interaction, { components: [], embeds: [embed] }).catch(log4js.trace);

            const collector = interaction.channel.createMessageCollector({
                time,
                filter: (x) => x.author.id === user.id
            });

            collector.on('collect', async (message) => {
                message.delete().catch(() => {});
                if (message.content?.toLowerCase() === 'cancel') {
                    collector.stop('cancel');
                    return resolve('cancel');
                }

                const channel =
                    message.mentions?.channels?.first() ??
                    message.guild.channels.cache.find((x) => x?.name.toLowerCase() === message.content.toLowerCase()) ??
                    message.guild.channels.cache.get(message.content) ??
                    /\d{16,18}/.test(message.content)
                        ? await message.guild.channels.fetch(message.content).catch(log4js.trace)
                        : null;

                if (!channel)
                    return sendAndDelete({
                        channel: message.channel as TextChannel,
                        content: { embeds: [invalidChannel(user)] }
                    });
                if (channelTypes.length > 0 && !channelTypes.includes(channel.type))
                    return sendAndDelete({
                        channel: message.channel as TextChannel,
                        content: { embeds: [invalidChannelType(user, channelTypes)] }
                    });
                let ok = true;
                checks.forEach((ch) => {
                    if (!ch.check(channel)) {
                        ok = false;
                        return sendAndDelete({ channel: message.channel as TextChannel, content: ch.reply });
                    }
                });
                if (!ok) return;

                collector.stop('resolved');
                return resolve(channel as GuildChannel);
            });

            collector.on('end', (_c, r) => {
                if (r === 'resolved' || r === 'cancel') return;
                return resolve("time's up");
            });
        });
    }
);