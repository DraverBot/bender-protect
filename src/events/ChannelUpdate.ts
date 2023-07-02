import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';
import { ChannelType } from 'discord.js';

export default new AmethystEvent('channelUpdate', async (bef, aft) => {
    if (bef.isDMBased() || aft.isDMBased()) return;
    const guild = aft.guild;

    const valid = await CheckUserAction.process({ guild, event: 'ChannelUpdate', targetId: aft.id });
    const reedit = async () => {
        const data = bef.toJSON() as any;
        if (aft.type !== ChannelType.GuildCategory && bef.type !== ChannelType.GuildCategory) {
            await aft.edit({
                ...data,
                name: bef.name,
                permissionOverwrites: bef.permissionOverwrites.cache,
                rateLimitPerUser: data.rateLimitPerUser,
                position: bef.rawPosition
            }).catch(log4js.trace);
        } else {
            await aft.edit({
                ...data,
                name: bef.name,
                permissionOverwrites: bef.permissionOverwrites,
                position: bef.rawPosition
            });
        }
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'ChannelEdit' });
    }
});
