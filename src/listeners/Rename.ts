import { log4js } from "amethystjs";
import SendErrorLogToOwner from "../processes/SendErrorLogToOwner";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";
import { pingUser } from "../utils/toolbox";
import ApplySanction from "../processes/ApplySanction";

export default new DraverAPIListener('Rename').addKey('Censor').setRun(async({ client, user, guild, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild)
        const member = guild.members.cache.get(data.member);

        if (!member) return SendErrorLogToOwner.process({ guild, logMessage: `Je n'ai pas pu rétablir le pseudo de ${pingUser(data.member)} (\`${data.member}\`) changé par ${pingUser(user)} (\`${user}\`)` })
        member.setNickname(data.oldName).catch(log4js.trace)
        
        ApplySanction.process({ guild, user, sanction: 'memberEdit' })
    }
})