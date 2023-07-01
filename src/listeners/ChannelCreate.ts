import ApplySanction from '../processes/ApplySanction';
import { DraverAPIListener } from '../structures/APIListener';
import { unAllowedAction } from '../utils/embeds';

export default new DraverAPIListener('ChannelCreate').setRun(async ({ user, guild, data, client }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        guild.channels.delete(data.id, 'User not whitelisted').catch(() => {});
        if (user) user.send({ embeds: [unAllowedAction(user, guild)] }).catch(() => {});
        ApplySanction.process({ guild, user, sanction: 'ChannelCreate' });
    }
});
