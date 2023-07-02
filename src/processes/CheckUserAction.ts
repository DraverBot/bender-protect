import { AuditLogEvent, Guild, GuildAuditLogsEntry, User } from 'discord.js';
import { Process } from '../structures/Process';
import { log4js } from 'amethystjs';
import { isDraver } from '../utils/toolbox';

export default new Process(
    'check user action',
    async <Key extends keyof typeof AuditLogEvent>({
        guild,
        event,
        targetId
    }: {
        guild: Guild;
        event: Key;
        targetId: string;
    }) => {
        return new Promise<
            undefined | { user: User; validated: boolean; log: GuildAuditLogsEntry<(typeof AuditLogEvent)[Key]> }
        >(async (resolve) => {
            const logs = await guild
                .fetchAuditLogs({
                    type: AuditLogEvent[event],
                    limit: 1
                })
                .catch(log4js.trace);
            if (!logs || logs.entries.size === 0) return resolve(undefined);

            if (logs.entries.first().executorId === guild.client.user.id || isDraver(logs.entries.first().executorId))
                return resolve({ user: logs.entries.first().executor, log: logs.entries.first(), validated: true });

            return resolve({
                user: logs.entries.first().executor,
                log: logs.entries.first(),
                validated: guild.client.whitelist.isWhitelisted(guild, logs.entries.first().executorId)
            });
        });
    }
);
