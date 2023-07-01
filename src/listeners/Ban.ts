import ApplySanction from "../processes/ApplySanction";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";

export default new DraverAPIListener('Ban').setRun(async({ client, guild, user, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild)
        guild.members.unban(data.member).catch(() => {});

        ApplySanction.process({ guild, user, sanction: 'Ban' })
    }
})