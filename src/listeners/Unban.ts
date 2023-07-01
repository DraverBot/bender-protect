import { log4js } from 'amethystjs';
import SendUnallow from '../processes/SendUnallow';
import { DraverAPIListener } from '../structures/APIListener';
import ApplySanction from '../processes/ApplySanction';

export default new DraverAPIListener('Unban').setRun(async ({ client, user, guild, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild);
        guild.members.ban(data.member).catch(log4js.trace);

        ApplySanction.process({ guild, user, sanction: 'Unban' });
    }
});
