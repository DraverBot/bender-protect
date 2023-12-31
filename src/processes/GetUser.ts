import { CommandInteraction, EmbedBuilder, MessageCreateOptions, TextChannel, User } from 'discord.js';
import { Process } from '../structures/Process';
import { askUser, invalidUser } from '../utils/embeds';
import { sendAndDelete, systemReply } from '../utils/toolbox';
import { log4js } from 'amethystjs';

export default new Process(
    'get user',
    async ({
        interaction,
        user,
        time = 120000,
        embed = askUser(user),
        checks = []
    }: {
        interaction: CommandInteraction;
        user: User;
        embed?: EmbedBuilder;
        time?: number;
        checks?: { check: (u: User) => boolean; reply: MessageCreateOptions }[];
    }) => {
        return new Promise<'cancel' | "time's up" | User>(async (resolve) => {
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

                const _user =
                    message.mentions?.users?.first() ??
                    message.guild.members.cache.find(
                        (x) => x?.user.username.toLowerCase() === message.content.toLowerCase()
                    )?.user ??
                    message.guild.members.cache.get(message.content)?.user;

                if (!_user)
                    return sendAndDelete({
                        channel: message.channel as TextChannel,
                        content: { embeds: [invalidUser(user)] }
                    });
                let ok = true;
                checks.forEach((ch) => {
                    if (!ch.check(_user)) {
                        ok = false;
                        return sendAndDelete({ channel: message.channel as TextChannel, content: ch.reply });
                    }
                });
                if (!ok) return;

                collector.stop('resolved');
                return resolve(_user);
            });

            collector.on('end', (_c, r) => {
                if (r === 'resolved' || r === 'cancel') return;
                return resolve("time's up");
            });
        });
    }
);
