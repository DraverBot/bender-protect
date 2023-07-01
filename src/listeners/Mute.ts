import ApplySanction from "../processes/ApplySanction";
import SendErrorLogToOwner from "../processes/SendErrorLogToOwner";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";
import { pingUser } from "../utils/toolbox";

export default new DraverAPIListener('Mute').setRun(async({ client, user, guild, data, ...rest }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild)
        const member = guild.members.cache.get(data.member)
        ApplySanction.process({ guild, user, sanction: 'Mute' })

        if (!member) return SendErrorLogToOwner.process({ guild, logMessage: `Je n'ai pas pu enlever l'exclusion de ${pingUser(data.member)} (\`${data.member}\`) par ${pingUser(rest.userId)} (\`${rest.userId}\`)` })

        member.timeout(1).catch(() => {});
    }
})