import { AmethystCommand, log4js, preconditions } from "amethystjs";
import whitelisted from "../preconditions/whitelisted";
import perms from "../preconditions/perms";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import ms from "ms";
import { cancel, classic, invalidTime, wait } from "../utils/embeds";
import { addModLog, confirm, pingUser, secondsToWeeks } from "../utils/toolbox";

export default new AmethystCommand({
    name: 'tempban',
    description: "Banni un membre temporairement",
    clientPermissions: ['BanMembers'],
    preconditions: [preconditions.GuildOnly, whitelisted, perms],
    options: [
        {
            name: 'membre',
            description: "Membre que vous voulez bannir temporairement",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'durée',
            description: "Durée du bannissement",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'raison',
            description: "Raison du bannissement",
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ]
}).setChatInputRun(async({ interaction, options, client }) => {
    const member = options.getMember('membre') as GuildMember
    const duration = ms(options.getString('durée'))
    const reason = options.getString('raison') ?? 'Pas de raison'

    if (!duration || isNaN(duration)) return interaction.reply({ embeds: [ invalidTime(interaction.user) ] }).catch(log4js.trace)
    
    const confirmation = await confirm({
        interaction,
        user: interaction.user,
        embed: classic(interaction.user, { question: true }).setTitle("Bannissement temporaire").setDescription(`Vous êtes sur le point de bannir ${pingUser(member)} pour ${secondsToWeeks(duration, true)} pour la raison \`\`\`${reason}\`\`\``)
    }).catch(log4js.trace)

    if (!confirmation || confirmation === 'cancel' || !confirmation?.value) return interaction.editReply({ embeds: [ cancel() ], components: [] }).catch(log4js.trace)
    
    await interaction.editReply({ embeds: [ wait(interaction.user) ], components: [] }).catch(log4js.trace)

    await member.send({
        embeds: [ classic(interaction.user, { accentColor: true }).setTitle("Bannissement temporaire").setDescription(`Vous avez été banni de **${interaction.guild.name}** par ${interaction.user.username} pour la raison :\`\`\`${reason}\`\`\` pendant ${secondsToWeeks(duration, true)}`) ]
    }).catch(log4js.trace)
    await client.tempbans.tempban({
        user: member,
        deleteMessageCount: 604800,
        guild: interaction.guild,
        reason,
        time: duration
    }).catch(log4js.trace)
    addModLog({
        guild: interaction.guild,
        member_id: member.id,
        mod_id: interaction.user.id,
        reason: reason + ` ( pendant ${secondsToWeeks(duration / 1000)} )`,
        type: 'Tempban'
    })

    interaction.editReply({
        embeds: [ classic(interaction.user, { accentColor: true }).setTitle("Bannissement temporaire").setDescription(`${member.user.username} a été banni pendant ${secondsToWeeks(duration, true)}`) ]
    }).catch(log4js.trace)
})