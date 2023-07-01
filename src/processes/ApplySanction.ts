import { Guild, GuildMember, PermissionsString, User } from 'discord.js';
import { Process } from '../structures/Process';
import { SanctionName } from '../typings/database';
import { log4js } from 'amethystjs';

export default new Process(
    'apply sanction',
    async ({
        guild,
        user,
        sanction: sanctionName
    }: {
        guild: Guild;
        user: User | GuildMember;
        sanction: keyof typeof SanctionName;
    }) => {
        const { enabled, sanction, time, name } = guild.client.sanctions.getSanction(
            guild.id,
            SanctionName[sanctionName]
        );
        if (!enabled) return;

        const member = user instanceof GuildMember ? user : guild.members.cache.get(user.id);

        if (sanction === 'ban') {
            member.ban({ reason: `Auto-sanction by Bender protect` }).catch(() => {});
        } else if (sanction === 'downgrade') {
            const roles = member.roles.cache.filter((x) =>
                (
                    [
                        'Administrator',
                        'ManageChannels',
                        'ManageNicknames',
                        'ManageGuild',
                        'ManageRoles',
                        'BanMembers',
                        'KickMembers',
                        'ModerateMembers',
                        'ViewAuditLog'
                    ] as PermissionsString[]
                ).some((y) => x.permissions.has(y))
            );
            member.roles.remove(roles).catch(() => {});
        } else if (sanction === 'kick') {
            member.kick(`Auto-sanction by Bender Protect`).catch(log4js.trace);
        } else if (sanction === 'tempban') {
            guild.client.tempbans.tempban({
                user: member,
                guild: guild.id,
                time,
                deleteMessageCount: 0
            });
        }
    }
);
