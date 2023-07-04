import { AmethystEvent, log4js } from "amethystjs";
import CheckUserAction from "../processes/CheckUserAction";
import { GuildMember } from "discord.js";
import ApplySanction from "../processes/ApplySanction";
import SendUnallow from "../processes/SendUnallow";

export default new AmethystEvent('guildMemberUpdate', async(bef, aft) => {
    const guild = bef.guild;

    const change = () => {
        const compare = (k: keyof GuildMember) => aft[k] != bef[k]

        return compare('communicationDisabledUntil') || compare('isCommunicationDisabled') || compare('communicationDisabledUntilTimestamp');
    }

    if (!change()) return;

    const valid = await CheckUserAction.process({ guild, event: 'MemberUpdate', targetId: bef.id });
    const reedit = async () => {
        if (bef.isCommunicationDisabled() && !aft.isCommunicationDisabled()) {
            bef.disableCommunicationUntil(bef.communicationDisabledUntil, 'Auto-mod by Bender Protect').catch(log4js.trace)
        } else {
            aft.disableCommunicationUntil(null, 'Auto-mod by Bender Protect').catch(log4js.trace)
        }
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'memberEdit' });
    }
})