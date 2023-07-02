import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('roleDelete', async (role) => {
    const guild = role.guild;

    const valid = await CheckUserAction.process({ guild, event: 'RoleDelete', targetId: role.id });
    const recreate = async () => {
        const created = await guild.roles
            .create({
                ...role,
                position: role.rawPosition,
                reason: `Auto-mod by Bender Protect`
            })
            .catch(log4js.trace);

        if (created) {
            role.members.forEach((m) => m.roles.add(created).catch(log4js.trace));
        }
    };
    if (!valid) {
        recreate();
        return;
    }

    if (!valid.validated) {
        recreate();
        await SendUnallow.process(valid.user, guild);
        ApplySanction.process({ guild, user: valid.user, sanction: 'roleDelete' });
    }
});
