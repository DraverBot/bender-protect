import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('channelCreate', async (channel) => {
    if (channel.isDMBased()) return;
    const guild = channel.guild;

    const valid = await CheckUserAction.process({ guild, event: 'ChannelCreate', targetId: channel.id });
    const deleteChannel = async () => {
        channel.delete('Auto-mod by Bender Protect').catch(() => {});
    };
    if (!valid) return deleteChannel();

    if (!valid.validated) {
        deleteChannel();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'ChannelCreate' });
    }
});
