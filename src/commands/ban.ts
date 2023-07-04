import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import whitelisted from '../preconditions/whitelisted';
import perms from '../preconditions/perms';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { cancel, classic, memberNotModeratable, wait } from '../utils/embeds';
import { addModLog, confirm, pingUser } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'ban',
    description: 'Banni un membre du serveur',
    clientPermissions: ['BanMembers'],
    preconditions: [preconditions.GuildOnly, whitelisted, perms],
    options: [
        {
            name: 'membre',
            description: 'Membre que vous voulez bannir',
            required: true,
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'raison',
            description: 'Raison de votre bannissement',
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ]
}).setChatInputRun(async ({ interaction, options, client }) => {
    const member = options.getMember('membre') as GuildMember;
    const reason = options.getString('raison') ?? 'Pas de raison';

    if (!member.bannable)
        return interaction.reply({ embeds: [memberNotModeratable(interaction.user)] }).catch(log4js.trace);

    const confirmation = await confirm({
        interaction,
        user: interaction.user,
        embed: classic(interaction.user, { question: true })
            .setTitle('Bannissement')
            .setDescription(`Vous êtes sur le point de bannir ${pingUser(member)} pour la raison \`\`\`${reason}\`\`\``)
    }).catch(log4js.trace);

    if (!confirmation || confirmation === 'cancel' || !confirmation?.value)
        return interaction.editReply({ embeds: [cancel()], components: [] }).catch(log4js.trace);

    await interaction.editReply({ embeds: [wait(interaction.user)], components: [] }).catch(log4js.trace);

    await member
        .send({
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle('Bannissement')
                    .setDescription(
                        `Vous avez été banni de **${interaction.guild.name}** par ${interaction.user.username} pour la raison :\`\`\`${reason}\`\`\``
                    )
            ]
        })
        .catch(log4js.trace);
    await member.ban({ reason, deleteMessageSeconds: 604800 }).catch(log4js.trace);

    addModLog({
        guild: interaction.guild,
        member_id: member.id,
        mod_id: interaction.user.id,
        reason,
        type: 'Ban'
    });

    interaction
        .editReply({
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle('Bannissement')
                    .setDescription(`${member.user.username} a été banni`)
            ]
        })
        .catch(log4js.trace);
});
