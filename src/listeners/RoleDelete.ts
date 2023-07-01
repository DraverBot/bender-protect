import { log4js } from "amethystjs";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";
import ApplySanction from "../processes/ApplySanction";

export default new DraverAPIListener('RoleDelete').setRun(async({ client, user, guild, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild)
        guild.roles.create({
            name: data.value.name,
            color: data.value.color,
            hoist: data.value.hoist,
            icon: data.value.icon,
            mentionable: data.value.mentionable,
            position: data.value.rawPosition,
            permissions: data.value.permissions,
            unicodeEmoji: data.value.unicodeEmoji,
        }).catch(log4js.trace)

        ApplySanction.process({ guild, user, sanction: 'roleDelete' })
    }
})