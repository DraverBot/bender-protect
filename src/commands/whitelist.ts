import { AmethystCommand, AmethystPaginator, log4js, preconditions } from 'amethystjs';
import { ApplicationCommandOptionType } from 'discord.js';
import { cancel, classic, emptyWhitelist, paginationInvalidPage, unallowedInteraction } from '../utils/embeds';
import { pingUser, plurial, confirm } from '../utils/toolbox';

export default new AmethystCommand({
    name: 'whitelist',
    description: 'Gère la whitelist du serveur',
    options: [
        {
            name: 'afficher',
            description: 'Affiche la whitelist du serveur',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'ajouter',
            description: 'Ajoute un utilisateur à la whitelist',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'utilisateur',
                    description: 'Utilisateur que vous voulez ajouter',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'retirer',
            description: "Retire quelqu'un de la whitelist",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'utilisateur',
                    description: 'Utilisateur que vous voulez retirer',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        }
    ],
    preconditions: [preconditions.GuildOnly, preconditions.OwnerOnly]
}).setChatInputRun(async ({ interaction, options, client }) => {
    const cmd = options.getSubcommand();
    if (cmd === 'afficher') {
        const list = client.whitelist.getList(interaction.guild.id);

        if (list.length === 0)
            return interaction
                .reply({
                    embeds: [emptyWhitelist(interaction.user)]
                })
                .catch(log4js.trace);

        const embed = () =>
            classic(interaction.user, { accentColor: true })
                .setTitle('Whitelist')
                .setDescription(
                    `Il y a **${list.length.toLocaleString(interaction.locale)}** personne${plurial(list)}`
                );
        if (list.length <= 25) {
            const rep = embed();

            rep.setDescription(`${rep.data.description}\n\n${list.map(pingUser).join(' ')}`);
            interaction
                .reply({
                    embeds: [rep]
                })
                .catch(log4js.trace);
        } else {
            const embeds = [embed().setDescription(`${embed().data.description}\n\n`)];

            list.forEach((x, i) => {
                if (i % 25 === 0 && i > 0) embeds.push(embed().setDescription(`${embed().data.description}\n\n`));

                embeds[embeds.length - 1].setDescription(
                    `${embeds[embeds.length - 1].data.description}${pingUser(x)} `
                );
            });

            new AmethystPaginator({
                interaction,
                embeds,
                user: interaction.user,
                interactionNotAllowedContent: {
                    embeds: [unallowedInteraction(interaction.user)],
                    ephemeral: true
                },
                invalidPageContent: (max) => ({
                    embeds: [paginationInvalidPage(interaction.user, max)],
                    ephemeral: true
                }),
                modal: {
                    title: 'Page',
                    fieldName: 'Numéro de la page'
                },
                numeriseLocale: interaction.locale,
                cancelContent: { embeds: [cancel()], ephemeral: true }
            });
        }
    }
    if (cmd === 'ajouter') {
        const user = options.getUser('utilisateur');
        if (client.whitelist.isWhitelisted(interaction.guild, user.id))
            return interaction.reply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Whitelisté')
                        .setDescription(`${pingUser(user)} est déjà whitelisté`)
                ]
            });
        if (user.id === client.user.id)
            return interaction
                .reply({
                    embeds: [
                        classic(interaction.user, { denied: true })
                            .setTitle('Bender')
                            .setDescription(`Je suis déjà whitelisté`)
                    ]
                })
                .catch(log4js.trace);

        await interaction.deferReply().catch(log4js.trace);
        if (user.bot) {
            const res = await confirm({
                interaction,
                user: interaction.user,
                embed: classic(interaction.user, { question: true })
                    .setTitle('Bot')
                    .setDescription(
                        `${pingUser(
                            user
                        )} est un bot. Il n'est pas conseillé d'ajouter des bots à la whitelist, car il se peut que d'autres utilisateurs se servent de ce bot.\nCependant, [Draver](https://discord.com/api/oauth2/authorize?client_id=1056111589897551954&permissions=1633107176695&scope=bot%20applications.commands) est compatible avec moi, ce qui fait que vous pouvez whitelister Draver en toute sérénité, puisque ses actions seront vérifiées et l'auteur sera identifié.\nEn cas de doute, l'action sera annulée.`
                    )
            }).catch(log4js.trace);

            if (!res || res === 'cancel' || !res?.value)
                return interaction.editReply({ embeds: [cancel()], components: [] }).catch(log4js.trace);
        }

        client.whitelist.addUser(interaction.guild, user.id);
        interaction
            .editReply({
                embeds: [
                    classic(interaction.user, { accentColor: true })
                        .setTitle('Utilisateur ajouté')
                        .setDescription(
                            `${pingUser(
                                user
                            )} a été ajouté à la whitelist.\nVous pouvez le retirer à tout moment avec la commande \`/whitelist retirer\``
                        )
                ],
                components: []
            })
            .catch(log4js.trace);
    }
    if (cmd === 'retirer') {
        const user = options.getUser('utilisateur');
        if (!client.whitelist.isWhitelisted(interaction.guild, user.id))
            return interaction.reply({
                embeds: [
                    classic(interaction.user, { denied: true })
                        .setTitle('Non whitelisté')
                        .setDescription(`${pingUser(user)} n'est pas whitelisté`)
                ]
            });

        client.whitelist.removeUser(interaction.guild, user.id);
        interaction
            .reply({
                embeds: [
                    classic(interaction.user, { accentColor: true })
                        .setTitle('Utilisateur retiré')
                        .setDescription(`${pingUser(user)} a été retiré de la whitelist.`)
                ]
            })
            .catch(log4js.trace);
    }
});
