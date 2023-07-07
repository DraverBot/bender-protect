import { AmethystCommand, log4js, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { addModLog, displayDate, pingUser, secondsToWeeks } from '../utils/toolbox';
import whitelisted from '../preconditions/whitelisted';
import perms from '../preconditions/perms';
import { classic, memberBot, memberNotModeratable } from '../utils/embeds';

export default new AmethystCommand({
    name: 'mute',
    description: 'Mute une personne du serveur',
    options: [
        {
            name: 'utilisateur',
            description: 'Utilisateur à réduire au silence',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'durée',
            description: 'Durée de la réduction au silence',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            choices: [
                {
                    name: '1 minute',
                    value: 60
                },
                {
                    name: '5 minutes',
                    value: 300
                },
                {
                    name: '10 minutes',
                    value: 600
                },
                {
                    name: '15 minutes',
                    value: 900
                },
                {
                    name: '20 minutes',
                    value: 1200
                },
                {
                    name: '30 minutes',
                    value: 1800
                },
                {
                    name: '1 heure',
                    value: 3600
                },
                {
                    name: '2 heures',
                    value: 7200
                },
                {
                    name: '4 heures',
                    value: 14400
                },
                {
                    name: '6 heures',
                    value: 21600
                },
                {
                    name: '12 heures',
                    value: 43200
                },
                {
                    name: '1 jour',
                    value: 86400
                },
                {
                    name: '2 jours',
                    value: 172800
                },
                {
                    name: '3 jours',
                    value: 259200
                },
                {
                    name: '4 jours',
                    value: 345600
                },
                {
                    name: '5 jours',
                    value: 432000
                },
                {
                    name: '6 jours',
                    value: 518400
                },
                {
                    name: '1 semaine',
                    value: 604800
                },
                {
                    name: '2 semaines',
                    value: 1209600
                },
                {
                    name: '1 mois',
                    value: 2419200
                }
            ]
        },
        {
            name: 'raison',
            description: 'Raison de la réduction au silence',
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ],
    preconditions: [preconditions.GuildOnly, whitelisted, perms]
}).setChatInputRun(async ({ interaction, options }) => {
    const member = options.getMember('utilisateur') as GuildMember;
    const duration = options.getInteger('durée');
    const reason = options.getString('raison') ?? `Pas de raison (${secondsToWeeks(duration)})`;

    if (member.user.bot)
        return interaction
            .reply({
                embeds: [memberBot(interaction.user, member)]
            })
            .catch(log4js.trace);
    if (!member.moderatable)
        return interaction.reply({ embeds: [memberNotModeratable(interaction.user)] }).catch(log4js.trace);

    const end = Date.now() + duration * 1000;
    await interaction.deferReply().catch(log4js.trace);
    const res = await member.disableCommunicationUntil(end, reason).catch(log4js.trace);

    if (!res)
        return interaction
            .editReply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Mute échoué')
                        .setDescription(`Je n'ai pas pu muter ${pingUser(member)}`)
                ]
            })
            .catch(log4js.trace);

    await addModLog({
        guild: interaction.guild,
        member_id: member.id,
        mod_id: interaction.user.id,
        type: 'Mute',
        reason
    }).catch(log4js.trace);

    interaction
        .editReply({
            embeds: [
                classic(interaction.user, { accentColor: true })
                    .setTitle('Réduction au silence')
                    .setDescription(`${pingUser(member)} a été réduit au silence jusqu'a ${displayDate(end, true)}`)
            ]
        })
        .catch(log4js.trace);
});
