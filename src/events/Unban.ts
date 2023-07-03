import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('guildBanRemove', async (ban) => {
    const guild = ban.guild;

    const valid = await CheckUserAction.process({ guild, event: 'MemberBanRemove', targetId: ban.user.id });
    const unban = async () => {
        await guild.members.ban(ban.user.id, { reason: "Auto-mod by Bender Protect" }).catch(log4js.trace);
    };

    if (!valid) return unban();
    if (!valid.validated) {
        unban();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'Unban' });
    }
});
