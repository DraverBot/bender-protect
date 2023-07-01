import ApplySanction from "../processes/ApplySanction";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";

export default new DraverAPIListener('ChannelDelete').setRun(async({ client, user, guild, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        SendUnallow.process(user, guild)
        
        guild.channels.create({
            ...data.value,
            parent: data.value.parentId,
            position: data.value.rawPosition,
            permissionOverwrites: data.permissions
        }).catch(() => {})
        ApplySanction.process({ guild, user, sanction: 'ChannelDelete' })
    }
})