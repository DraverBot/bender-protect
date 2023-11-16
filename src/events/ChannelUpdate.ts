import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';
import { CategoryChannel, ChannelType, GuildChannel } from 'discord.js';
import { sameCollections } from '../utils/toolbox';

export default new AmethystEvent('channelUpdate', async (bef, aft) => {
    if (bef.isDMBased() || aft.isDMBased()) return;
    const guild = aft.guild;
    const category = aft.type !== ChannelType.GuildCategory && bef.type !== ChannelType.GuildCategory;

    if (category) {
        const same = (x: keyof CategoryChannel) => aft[x] === bef[x];
        if (
            same('name') &&
            (!same('position') || !same('rawPosition')) &&
            same('rateLimitPerUser' as any) &&
            sameCollections(aft.permissionOverwrites.cache, bef.permissionOverwrites.cache)
        ) {
            return;
        }
    } else {
        const same = (x: keyof GuildChannel) => aft[x] === bef[x];
        if (
            same('name') &&
            (!same('position') || !same('rawPosition')) &&
            same('rateLimitPerUser' as any) &&
            sameCollections(aft.permissionOverwrites.cache, bef.permissionOverwrites.cache)
        )
            return;
    }

    const valid = await CheckUserAction.process({ guild, event: 'ChannelUpdate', targetId: aft.id });
    const reedit = async () => {
        const data = bef.toJSON() as any;
        if (category) {
            await aft
                .edit({
                    ...data,
                    name: bef.name,
                    permissionOverwrites: bef.permissionOverwrites.cache,
                    rateLimitPerUser: data.rateLimitPerUser,
                    position: bef.rawPosition
                })
                .catch(log4js.trace);
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
