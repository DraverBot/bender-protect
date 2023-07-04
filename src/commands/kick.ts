import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import whitelisted from '../preconditions/whitelisted';
import perms from '../preconditions/perms';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { cancel, classic, memberNotModeratable, wait } from '../utils/embeds';
import { addModLog, confirm, pingUser } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'kick',
    description: 'Expulse un membre du serveur',
    clientPermissions: ['KickMembers'],
    preconditions: [preconditions.GuildOnly, whitelisted, perms],
    options: [
        {
            name: 'membre',
            description: 'Membre que vous voulez exulser',
            required: true,
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'raison',
            description: 'Raison de votre expulsion',
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ]
}).setChatInputRun(async ({ interaction, options, client }) => {
    const member = options.getMember('membre') as GuildMember;
    const reason = options.getString('raison') ?? 'Pas de raison';

    if (!member.kickable)
        return interaction.reply({ embeds: [memberNotModeratable(interaction.user)] }).catch(log4js.trace);

    const confirmation = await confirm({
        interaction,
        user: interaction.user,
        embed: classic(interaction.user, { question: true })
            .setTitle('Expulsion')
            .setDescription(
                `Vous êtes sur le point d'expulser ${pingUser(member)} pour la raison \`\`\`${reason}\`\`\``
            )
    }).catch(log4js.trace);

    if (!confirmation || confirmation === 'cancel' || !confirmation?.value)
        return interaction.editReply({ embeds: [cancel()], components: [] }).catch(log4js.trace);

    await interaction.editReply({ embeds: [wait(interaction.user)], components: [] }).catch(log4js.trace);

    await member
        .send({
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle('Expulsion')
                    .setDescription(
                        `Vous avez été expulsé de **${interaction.guild.name}** par ${interaction.user.username} pour la raison :\`\`\`${reason}\`\`\``
                    )
            ]
        })
        .catch(log4js.trace);
    await member.kick(reason).catch(log4js.trace);

    addModLog({
        guild: interaction.guild,
        member_id: member.id,
        mod_id: interaction.user.id,
        reason,
        type: 'Kick'
    });

    interaction
        .editReply({
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle('Expulsion')
                    .setDescription(`${member.user.username} a été expulsé`)
            ]
        })
        .catch(log4js.trace);
});
