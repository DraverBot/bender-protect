import { AmethystCommand, log4js, preconditions } from "amethystjs";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import { addModLog, displayDate, pingUser, secondsToWeeks } from "../utils/toolbox";
import whitelisted from "../preconditions/whitelisted";
import perms from "../preconditions/perms";
import { classic, memberBot } from "../utils/embeds";

export default new AmethystCommand({
    name: 'unmute',
    description: "Unmute une personne du serveur",
    options: [
        {
            name: 'utilisateur',
            description: "Utilisateur dont vous voulez rétablir la voix",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'raison',
            description: 'Raison du rétablissement',
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ],
    preconditions: [preconditions.GuildOnly, whitelisted, perms]
}).setChatInputRun(async({ interaction, options }) => {
    const member = options.getMember('utilisateur') as GuildMember
    const reason = options.getString('raison') ?? `Pas de raison`;

    if (member.user.bot) return interaction.reply({
        embeds: [ memberBot(interaction.user, member) ]
    }).catch(log4js.trace)
    if (!member.communicationDisabledUntilTimestamp) return interaction.reply({
        embeds: [ classic(interaction.user, { denied: true }).setTitle("Membre non muté").setDescription(`${pingUser(member)} n'est pas muté`) ]
    }).catch(log4js.trace)

    await interaction.deferReply().catch(log4js.trace)
    const res = await member.timeout(null, reason).catch(log4js.trace)

    if (!res) return interaction.editReply({
        embeds: [classic(interaction.user, { denied: true }).setTitle("Rétablissement échoué").setDescription(`Je n'ai pas pu démuter ${pingUser(member)}`)]
    }).catch(log4js.trace)

    await addModLog({
        guild: interaction.guild,
        member_id: member.id,
        mod_id: interaction.user.id,
        type: 'Unmute',
        reason
    }).catch(log4js.trace)

    interaction.editReply({
        embeds:[ classic(interaction.user, { accentColor: true }).setTitle("Rétablissement de la voix").setDescription(`${pingUser(member)} a été démuté`) ]
    }).catch(log4js.trace)
})