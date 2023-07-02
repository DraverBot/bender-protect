import { CommandInteraction, EmbedBuilder, TextBasedChannel, User } from 'discord.js';
import { Process } from '../structures/Process';
import { classic, invalidNumber } from '../utils/embeds';
import { sendAndDelete, systemReply } from '../utils/toolbox';
import { log4js } from 'amethystjs';

export default new Process(
    'wait for number',
    async ({
        user,
        interaction,
        time = 180000,
        max = null,
        min = 0,
        whoCanReply = 'user',
        embed = classic(user, { question: true }).setTitle('Nombre').setDescription(`Quel nombre choisissez-vous ?`)
    }: {
        interaction: CommandInteraction;
        time?: number;
        max?: number;
        min?: number;
        user: User;
        whoCanReply?: 'everyone' | 'user' | 'everyonebutuser' | 'whitelisted';
        embed?: EmbedBuilder;
    }) => {
        return new Promise<'cancel' | "time's up" | number>(async (resolve) => {
            systemReply(interaction, { embeds: [embed], components: [] }).catch(log4js.trace);

            const collector = interaction.channel.createMessageCollector({
                time,
                filter: (x) =>
                    whoCanReply === 'everyone'
                        ? true
                        : whoCanReply === 'whitelisted'
                        ? user.client.whitelist.isWhitelisted(interaction.guild, x.author.id)
                        : whoCanReply === 'everyonebutuser'
                        ? x.author.id !== user.id
                        : x.author.id === user.id
            });

            collector.on('collect', async (msg) => {
                msg.delete().catch(() => {});
                if (msg.content?.toLowerCase() == 'cancel') {
                    collector.stop('cancel');
                    return resolve('cancel');
                }
                const int = parseInt(msg.content);
                if (!int || isNaN(int)) {
                    sendAndDelete({
                        channel: msg.channel as TextBasedChannel,
                        content: { embeds: [invalidNumber(user, max, min)] }
                    });
                    return;
                }
                if (int < min || (max != null && max !== undefined && int > max)) {
                    sendAndDelete({
                        channel: msg.channel as TextBasedChannel,
                        content: { embeds: [invalidNumber(user, max, min)] }
                    });
                    return;
                }

                resolve(int);
                collector.stop('resolved');
            });

            collector.on('end', (_c, r) => {
                if (r === 'resolved' || r === 'cancel') return;
                return resolve("time's up");
            });
        });
    }
);
