import { GuildTextBasedChannel, User } from 'discord.js';
import { Process } from '../structures/Process';
import { log4js } from 'amethystjs';

export default new Process(
    'wait for confirm',
    async ({
        channel,
        time,
        content = 'cancel'
    }: {
        channel: GuildTextBasedChannel;
        time: number;
        content?: string;
    }) => {
        return new Promise<{ canceled?: boolean; user: User | null }>(async (resolve) => {
            const collector = channel.createMessageCollector({
                filter: (x) =>
                    channel.client.whitelist.isWhitelisted(channel.guild, x.author.id) &&
                    x.content.toLowerCase() === content,
                time,
                max: 1
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) return resolve({ canceled: false, user: null });
                collected.first().delete().catch(log4js.trace);
                return resolve({ canceled: true, user: collected.first().author });
            });
        });
    }
);
