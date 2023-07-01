import ApplySanction from '../processes/ApplySanction';
import SendUnallow from '../processes/SendUnallow';
import { DraverAPIListener } from '../structures/APIListener';

export default new DraverAPIListener('Kick').setRun(async ({ client, user, guild, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild);
        ApplySanction.process({ guild, user, sanction: 'kick' });
    }
});
