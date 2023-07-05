import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import { classic } from "../utils/embeds";
import { getRolePerm, util } from "../utils/toolbox";
import whitelisted from "../preconditions/whitelisted";

export default new AmethystCommand({
    name: 'help',
    description: "Affiche la page d'aide du bot",
    options: [
        {
            name: 'commande',
            description: "Commande que vous voulez voir",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true
        }
    ]
}).setChatInputRun(async({ interaction, options, client }) => {
    const cmd = options.getString('commande')
    if (cmd) {
        const command = client.chatInputCommands.find(x => x.options.name === cmd)?.options

        const emoji = (b: boolean) => util(b ? 'yes' : 'no')
        return interaction.reply({
            embeds: [ classic(interaction.user, { accentColor: true }).setTitle(`Commande ${command.name}`).setDescription(`**Description :**\`\`\`${command.description}\`\`\``).setFields(
                {
                    name: 'Exécutable en DM',
                    value: emoji(!command.preconditions?.includes(preconditions.GuildOnly)),
                    inline: true
                },
                {
                    name: 'Propriétaire seulement',
                    value: emoji(command.preconditions?.includes(preconditions.OwnerOnly)),
                    inline: true
                },
                {
                    name: 'Whitelist',
                    value: emoji(command.preconditions?.includes(whitelisted)),
                    inline: true
                },
                {
                    name: 'Permissions',
                    value: (!command.permissions || command.permissions?.length === 0) ? 'Aucune permission' : command.permissions?.map(x => `\`${getRolePerm(x)}\``).join(' '),
                    inline: false
                }
            ) ]
        })
    }

    await interaction.deferReply().catch(log4js.trace)
    await client.application.commands.fetch().catch(log4js.trace);

    const commandName = (name: string) => {
        const app = client.application.commands.cache.find(x => x.name === name)
        if (!app) return `\`/${name}\``
        return `</${name}:${app.id}>`
    }

    interaction.editReply({
        embeds: [ classic(interaction.user, { footerText: 'client', accentColor: true }).setTitle("Page d'aide").setDescription(`Voici la liste de mes commandes :\n${client.chatInputCommands.map(x => `${commandName(x.options.name)} : ${x.options.description}`).join('\n')}`).setFields({ name: "Plus d'info", value: `Pour avoir plus d'informations sur une commande,utilisez la commande ${commandName('help')} en précisant la commande que vous voulez voir` }) ]
    }).catch(log4js.trace)
})