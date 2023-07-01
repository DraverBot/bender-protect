import ApplySanction from "../processes/ApplySanction";
import SendErrorLogToOwner from "../processes/SendErrorLogToOwner";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";
import { pingRole, pingUser } from "../utils/toolbox";

export default new DraverAPIListener('RoleEdit').setRun(async({ client, guild, user, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        const role = guild.roles.cache.get(data.after.id) ?? await guild.roles.fetch(data.after.id).catch(() => {})

        if (!role) return SendErrorLogToOwner.process({ guild, logMessage: `Le rôle ${pingRole(data.after.id)} ( \`${data.after.id}\`) modifié par ${pingUser(user.id)} (\`${user.id}\`) n'a pas pu être rétablit` });
        SendUnallow.process(user, guild);
        const res = await role.edit(data.before).catch(() => {})
        if (!res) return SendErrorLogToOwner.process({ guild, logMessage: `Le rôle ${pingRole(data.after.id)} ( \`${data.after.id}\`) modifié par ${pingUser(user.id)} (\`${user.id}\`) n'a pas pu être rétablit` })

        ApplySanction.process({ guild, user, sanction: 'roleEdit' })
    }
})