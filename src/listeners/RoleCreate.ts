import { log4js } from 'amethystjs';
import { DraverAPIListener } from '../structures/APIListener';
import { unAllowedAction } from '../utils/embeds';
import ApplySanction from '../processes/ApplySanction';

export default new DraverAPIListener('RoleCreate').setRun(async ({ user, guild, client, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        guild.roles.delete(data.id).catch(log4js.trace);
        if (user) user.send({ embeds: [unAllowedAction(user, guild)] }).catch(() => {});

        ApplySanction.process({ guild, user, sanction: 'roleCreate' });
    }
});
