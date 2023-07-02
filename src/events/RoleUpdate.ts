import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('roleUpdate', async (bef, aft) => {
    const guild = aft.guild;

    const valid = await CheckUserAction.process({ guild, event: 'RoleUpdate', targetId: aft.id });
    const reedit = async () => {
        await aft
            .edit({
                ...bef,
                reason: 'Auto-mod by Bender Protect'
            })
            .catch(() => {});
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'roleEdit' });
    }
});
