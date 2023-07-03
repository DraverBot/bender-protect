import { CommandInteraction, EmbedBuilder, TextChannel, User } from "discord.js";
import { Process } from "../structures/Process";
import { askUser, invalidUser } from "../utils/embeds";
import { sendAndDelete, systemReply } from "../utils/toolbox";
import { log4js } from "amethystjs";

export default new Process('get user', async({ interaction, user, time = 120000, embed = askUser(user) }: { interaction: CommandInteraction; user: User; embed?: EmbedBuilder; time?: number; }) => {
    return new Promise<'cancel' | "time's up" | User>(async(resolve) => {
        await systemReply(interaction, { components: [], embeds: [embed] }).catch(log4js.trace)

        const collector = interaction.channel.createMessageCollector({
            time,
            filter: x => x.author.id === user.id
        })

        collector.on('collect', async(message) => {
            if (message.content?.toLowerCase() === 'cancel') return resolve('cancel')
            const user = message.mentions?.users?.first() ?? message.guild.members.cache.find(x => x?.user.username.toLowerCase() === message.content.toLowerCase())?.user ?? message.guild.members.cache.get(message.content)?.user

            if (!user) return sendAndDelete({ channel: message.channel as TextChannel, content: { embeds: [ invalidUser(user) ] } })

            return resolve(user)
        })
    })
})