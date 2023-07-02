import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('roleCreate', async (role) => {
    const guild = role.guild;

    const valid = await CheckUserAction.process({ guild, event: 'RoleCreate', targetId: role.id });
    if (!valid) return role.delete('Auto-mod by Bender-protect').catch(log4js.trace);

    if (!valid.validated) {
        role.delete('Auto-mod by Bender Protect').catch(log4js.trace);
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'roleCreate' });
    }
});
