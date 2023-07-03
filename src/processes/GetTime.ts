import { CommandInteraction, EmbedBuilder, User } from 'discord.js';
import { Process } from '../structures/Process';
import { invalidTime, timeQuestion } from '../utils/embeds';
import { sendAndDelete, systemReply } from '../utils/toolbox';
import { log4js } from 'amethystjs';
import ms from 'ms';

export default new Process(
    'get time',
    async ({
        interaction,
        user,
        time = 120000,
        embed = timeQuestion(user)
    }: {
        interaction: CommandInteraction;
        user: User;
        time?: number;
        embed?: EmbedBuilder;
    }) => {
        return new Promise<'cancel' | "time's up" | number>(async (resolve) => {
            await systemReply(interaction, {
                components: [],
                embeds: [embed]
            }).catch(log4js.trace);

            const collector = interaction.channel.createMessageCollector({
                time,
                filter: (x) => x.author.id === user.id
            });

            collector.on('collect', (msg) => {
                msg.delete().catch(() => {});
                if (msg.content.toLowerCase() === 'cancel') {
                    collector.stop('cancel');
                    return resolve('cancel');
                }
                const time = ms(msg.content);
                if (!time || isNaN(time)) {
                    sendAndDelete({ channel: msg.channel, content: { embeds: [invalidTime(user)] } });
                    return;
                }

                collector.stop('resolved');
                return resolve(time);
            });

            collector.on('end', (_c, r) => {
                if (r === 'cancel' || r === 'resolved') return;
                return resolve("time's up");
            });
        });
    }
);
