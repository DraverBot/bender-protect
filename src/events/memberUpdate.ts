import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';
import { GuildMember } from 'discord.js';

export default new AmethystEvent('guildMemberUpdate', async (bef, aft) => {
    const guild = aft.guild;

    const change = () => {
        const compare = (k: keyof GuildMember) => bef[k] != aft[k]
        const voiceChanged = () => {
            const compareVoice = (k: keyof GuildMember['voice']) => bef?.voice[k] != aft?.voice[k];
            if (!bef.voice && !aft.voice) return false;

            return compareVoice('channelId') || compareVoice('serverDeaf') || compareVoice('serverMute')
        }

        return compare('nickname') || voiceChanged()
    }

    if (!change()) return;

    const valid = await CheckUserAction.process({ guild, event: 'MemberUpdate', targetId: aft.id });
    const reedit = async () => {
        console.log(bef.voice)
        if (!!bef.voice?.channel || !!aft.voice?.channel) {
            aft.edit({
                channel: bef.voice?.channel,
                deaf: bef?.voice?.deaf,
                mute: bef?.voice?.mute,
                nick: bef?.nickname ?? null,
                roles: bef.roles?.cache,
                reason: "Auto-mod by Bender Protect",
            }).catch(log4js.trace)
        } else {
            aft.edit({
                nick: bef?.nickname ?? null,
                roles: bef.roles?.cache,
                reason: "Auto-mod by Bender Protect",
            }).catch(log4js.trace)
        }
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'memberEdit' });
    }
});
