import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';
import { ChannelType } from 'discord.js';

export default new AmethystEvent('channelDelete', async (channel) => {
    if (channel.isDMBased()) return;
    const guild = channel.guild;

    const valid = await CheckUserAction.process({ guild, event: 'ChannelDelete', targetId: channel.id });
    const reedit = async () => {
        const types = {};
        Object.keys(ChannelType).forEach((key) => (types[ChannelType[key]] = key));
        guild.channels
            .create({
                ...(channel.toJSON() as object),
                name: channel.name,
                reason: 'Auto-mod by Bender Protect',
                position: channel.rawPosition,
                type: channel.type,
                parent: channel.parent ?? null
            })
            .catch(log4js.trace);
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'roleEdit' });
    }
});
