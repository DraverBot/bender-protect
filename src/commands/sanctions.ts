import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { ApplicationCommandOptionType } from "discord.js";
import { sanctionTypeData, sanctionsData } from "../data/sanctionsData";
import GetTime from "../processes/GetTime";
import { cancel, classic } from "../utils/embeds";
import { removeKey, secondsToWeeks, systemReply } from "../utils/toolbox";
import { SanctionName } from "../typings/database";

export default new AmethystCommand({
    name: 'sanctions',
    description: "Gère les sanctions du serveur",
    preconditions: [preconditions.GuildOnly, preconditions.OwnerOnly],
    options: [
        {
            name: 'configurer',
            description: "Configure une sanction sur un évènement",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'évènement',
                    description: "Évènement dont vous voulez configurer la sanction",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'sanction',
                    description: "Sanction à appliquer",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'désactiver',
            description: "Désactive une sanction",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'évènement',
                    description: "Évènement que vous voulez désactiver",
                    required: true,
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
        {
            name: 'activer',
            description: "Active une sanction",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'évènement',
                    description: "Évènement que vous voulez activer",
                    required: true,
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String
                }
            ]
        },
        {
            name: 'afficher',
            description: "Affiche l'état des sanctions sur serveur",
            type: ApplicationCommandOptionType.Subcommand
        }
    ]
}).setChatInputRun(async({ interaction, options, client }) => {
    const cmd = options.getSubcommand()
    if (cmd === 'configurer') {
        const eventKey = options.getString('évènement') as keyof typeof sanctionsData;
        const sanctionKey = options.getString('sanction') as keyof typeof sanctionTypeData;

        const event = sanctionsData[eventKey]
        const sanction = sanctionTypeData[sanctionKey]

        if (sanction.time) {
            const time = await GetTime.process({ interaction, user: interaction.user, embed: classic(interaction.user, { question: true }).setTitle("Durée").setDescription(`Sur combien de temps voulez-vous régler la durée de **${sanction.name.toLowerCase()}** ?`) })

            if (time === "cancel" || time === "time's up") return interaction.editReply({ embeds: [ cancel() ] }).catch(log4js.trace)

            client.sanctions.setSanction(interaction.guild.id, { name: eventKey, enabled: true, time, type: sanctionKey })
        } else {
            client.sanctions.setSanction(interaction.guild.id, { name: eventKey, enabled: true, time: 0, type: sanctionKey })
        }
        systemReply(interaction, {
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle("Sanction configurée")
                    .setDescription(`La sanction **${
                        sanction.name.toLowerCase()
                    }**${sanction.time ? ` pendant ${secondsToWeeks(Math.floor((client.sanctions.getSanction(interaction.guild.id, eventKey)?.time ?? 0) / 1000))}` : ""} sera appliquée sur **${event.name.toLowerCase()}**`
                    )
                ]})
    }
    if (cmd === 'désactiver') {
        const eventKey = options.getString('évènement') as keyof typeof sanctionsData;
        const event = sanctionsData[eventKey];

        client.sanctions.setSanction(interaction.guild.id, {...removeKey(client.sanctions.getSanction(interaction.guild.id, eventKey), 'sanction'), type: client.sanctions.getSanction(interaction.guild.id, eventKey).sanction, enabled: false})

        interaction.reply({
            embeds: [classic(interaction.user, { accentColor: true }).setTitle("Sanction désactivée").setDescription(`La sanction de **${event.name.toLowerCase()}** a été désactivée`)]
        }).catch(log4js.trace)
    }
    if (cmd === 'activer') {
        const eventKey = options.getString('évènement') as keyof typeof sanctionsData;
        const event = sanctionsData[eventKey];

        client.sanctions.setSanction(interaction.guild.id, {...removeKey(client.sanctions.getSanction(interaction.guild.id, eventKey), 'sanction'), type: client.sanctions.getSanction(interaction.guild.id, eventKey).sanction, enabled: true})

        interaction.reply({
            embeds: [classic(interaction.user, { accentColor: true }).setTitle("Sanction activée").setDescription(`La sanction de **${event.name.toLowerCase()}** a été activée`)]
        }).catch(log4js.trace)
    }
    if (cmd === 'afficher') {
        const configs = client.sanctions.getList(interaction.guild.id)

        const embed = classic(interaction.user, { accentColor: true }).setTitle("Sanctions").setDescription(`Voici l'état des sanctions du serveur`)

        let count = 0;
        configs.forEach((conf) => {
            count++;
            if (count === 3) count = 0;
            embed.addFields({
                name: sanctionsData[conf.name].name,
                value: `${sanctionTypeData[conf.sanction].name}${sanctionTypeData[conf.sanction].time ? ` pendant ${secondsToWeeks(Math.floor(conf.time / 1000))}` : ''} ( ${conf.enabled ? 'activé' : 'désactivé'} )`,
                inline: count > 0
            });
        })

        interaction.reply({
            embeds: [ embed ]
        }).catch(log4js.trace);
    }
})