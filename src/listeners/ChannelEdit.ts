import { GuildBasedChannel } from "discord.js";
import SendErrorLogToOwner from "../processes/SendErrorLogToOwner";
import SendUnallow from "../processes/SendUnallow";
import { DraverAPIListener } from "../structures/APIListener";
import { pingChannel, pingUser } from "../utils/toolbox";
import ApplySanction from "../processes/ApplySanction";

export default new DraverAPIListener('ChannelEdit').setRun(async({ client, guild, user, data }) => {
    if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
        const channel = guild.channels.cache.get(data.after.id) ?? await guild.channels.fetch(data.after.id).catch(() => {})

        if (!channel) return SendErrorLogToOwner.process({ guild, logMessage: `Le salon ${pingChannel(data.after.id)} ( \`${data.after.id}\`) modifié par ${pingUser(user.id)} (\`${user.id}\`) n'a pas pu être rétablit` });
        SendUnallow.process(user, guild);
        const res = await channel.edit(data.before).catch(() => {})
        if (!res) return SendErrorLogToOwner.process({ guild, logMessage: `Le salon ${pingChannel(channel)} ( \`${data.after.id}\`) modifié par ${pingUser(user.id)} (\`${user.id}\`) n'a pas pu être rétablit` })

        ApplySanction.process({ guild, user, sanction: 'ChannelEdit' })
    }
})