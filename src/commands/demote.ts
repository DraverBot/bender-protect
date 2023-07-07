import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType, GuildMember, PermissionsString } from 'discord.js';
import whitelisted from '../preconditions/whitelisted';
import perms from '../preconditions/perms';
import { classic } from '../utils/embeds';
import { addModLog, pingUser, plurial } from '../utils/toolbox';
import { modActionType } from '../typings/draver';

export default new AmethystCommand({
    name: 'destituer',
    description: "Destitue quelqu'un de ses rôles de modération",
    options: [
        {
            name: 'membre',
            description: 'Membre que vous voulez destituer',
            required: true,
            type: ApplicationCommandOptionType.User
        },
        {
            name: 'raison',
            description: 'Raison de la destitution',
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ],
    preconditions: [preconditions.GuildOnly, whitelisted, perms],
    clientPermissions: ['ManageRoles']
}).setChatInputRun(async ({ interaction, client, options }) => {
    const member = options.getMember('membre') as GuildMember;
    const reason = options.getString('raison') ?? 'Pas de raison';

    if (
        interaction.user.id !== interaction.guild.ownerId &&
        client.whitelist.isWhitelisted(interaction.guild, member.id)
    )
        return interaction
            .reply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Utilisateur whitelisté')
                        .setDescription(`${pingUser(member)} est whitelisté`)
                ]
            })
            .catch(log4js.trace);

    await interaction.deferReply().catch(log4js.trace);
    const roles = member.roles.cache.filter((x) =>
        (
            [
                'Administrator',
                'ManageChannels',
                'ManageNicknames',
                'ManageGuild',
                'ManageRoles',
                'BanMembers',
                'KickMembers',
                'ModerateMembers',
                'ViewAuditLog'
            ] as PermissionsString[]
        ).some((y) => x.permissions.has(y))
    );
    if (roles.size === 0)
        return interaction
            .editReply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Aucun rôle')
                        .setDescription(`${pingUser(member)} n'a aucun rôle de modération que je peux lui retirer`)
                ]
            })
            .catch(log4js.trace);

    const res = await member.roles.remove(roles).catch(() => {});
    if (!res)
        return interaction
            .editReply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Destitution échouée')
                        .setDescription(
                            `Je n'ai pas pu destituer ${pingUser(
                                member
                            )}\nVérifiez que mon rôle se trouve au-dessus des autres et réessayez`
                        )
                ]
            })
            .catch(log4js.trace);

    addModLog({
        guild: interaction.guild,
        mod_id: interaction.user.id,
        reason: `${reason} ( ${roles.size} rôles retiré${plurial(roles.size)} )`,
        member_id: member.id,
        type: 'Demote'
    });

    interaction
        .editReply({
            embeds: [
                classic(interaction.user, { mod: true })
                    .setTitle('Destitution')
                    .setDescription(`${pingUser(member)} a été destitué de ses rôles de modération`)
            ]
        })
        .catch(log4js.trace);
});
