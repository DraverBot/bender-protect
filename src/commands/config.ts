import { AmethystCommand, preconditions } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import { configs } from "../typings/database";
import { configsData } from "../data/configsData";

export default new AmethystCommand({
    name: 'configurer',
    description: "Configure les paramètres du serveur",
    preconditions: [preconditions.GuildOnly, preconditions.OwnerOnly],
    options: [
        {
            name: 'configurer',
            description: "Configure un paramètre",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'paramètre',
                    description: "Paramètre à configurer",
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ]
}).setChatInputRun(async({ interaction, options, client }) => {
    const cmd = options.getSubcommand()
    if (cmd === 'configurer') {
        const parameter = options.getString('paramètre') as keyof configs<false>;
        const metadata = configsData[parameter]

        if (metadata.type === 'boolean') {
        }
    }
})