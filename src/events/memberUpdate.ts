import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('guildMemberUpdate', async (bef, aft) => {
    const guild = aft.guild;

    const valid = await CheckUserAction.process({ guild, event: 'MemberUpdate', targetId: aft.id });
    const reedit = async () => {
        const data = bef.toJSON() as any;
        if (aft.voice?.channel || bef?.voice?.channel) {
            await aft.edit({
                communicationDisabledUntil: bef.communicationDisabledUntil,
                flags: bef.flags,
                nick: bef.nickname ?? null,
                roles: bef.roles.cache,
                deaf: bef.voice?.deaf,
                mute: bef?.voice?.mute,
                channel: bef?.voice?.channel,
                reason: 'Auto-mod by Bender Protect'
            });
        } else {
            await aft
                .edit({
                    communicationDisabledUntil: bef.communicationDisabledUntil,
                    flags: bef.flags,
                    nick: bef.nickname ?? null,
                    roles: bef.roles.cache,
                    reason: 'Auto-mod by Bender Protect'
                })
                .catch(log4js.trace);
        }
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'memberEdit' });
    }
});
