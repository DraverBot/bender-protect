import { AmethystCommand, log4js, preconditions, waitForInteraction, waitForMessage } from 'amethystjs';
import {
    ApplicationCommandOptionType,
    ChannelSelectMenuBuilder,
    ChannelType,
    ComponentType,
    Message,
    StringSelectMenuBuilder,
    TextChannel,
    UserSelectMenuBuilder
} from 'discord.js';
import { configs } from '../typings/database';
import { configsData } from '../data/configsData';
import { buildButton, capitalize, confirm, pingChannel, pingUser, resize, row, secondsToWeeks } from '../utils/toolbox';
import { cancel, classic } from '../utils/embeds';
import waitForNumber from '../processes/waitForNumber';
import GetTime from '../processes/GetTime';
import GetUser from '../processes/GetUser';
import GetChannel from '../processes/GetChannel';

export default new AmethystCommand({
    name: 'configurer',
    description: 'Configure les paramètres du serveur',
    preconditions: [preconditions.GuildOnly, preconditions.OwnerOnly],
    options: [
        {
            name: 'configurer',
            description: 'Configure un paramètre',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'paramètre',
                    description: 'Paramètre à configurer',
                    autocomplete: true,
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'afficher',
            description: "Affiche l'entièreté des paramètres",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'paramètre',
                    description: 'Paramètre spécifique que vous voulez voir',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    autocomplete: true
                }
            ]
        }
    ]
}).setChatInputRun(async ({ interaction, options, client }) => {
    const cmd = options.getSubcommand();
    if (cmd === 'configurer') {
        const parameter = options.getString('paramètre') as keyof configs<false>;
        const metadata = configsData[parameter];

        if (metadata.type === 'boolean') {
            const confirmation = await confirm({
                interaction,
                user: interaction.user,
                embed: classic(interaction.user, { question: true })
                    .setTitle(metadata.name)
                    .setDescription(`Voulez-vous activer ou désactiver **${metadata.name}** ?`),
                components: [
                    row(
                        buildButton({ label: 'Activer', style: 'Success', buttonId: 'Yes' }),
                        buildButton({ label: 'Désactiver', style: 'Danger', buttonId: 'No' })
                    )
                ]
            }).catch(log4js.trace);

            if (!confirmation || confirmation === 'cancel')
                return interaction.editReply({ embeds: [cancel()], components: [] }).catch(log4js.trace);

            client.confs.setConfig(interaction.guild.id, parameter, confirmation.value);
            interaction
                .editReply({
                    embeds: [
                        classic(interaction.user, { accentColor: true })
                            .setTitle('Paramètre configuré')
                            .setDescription(
                                `Le paramèter **${metadata.name}** a été configuré sur **${
                                    confirmation.value ? 'activé' : 'désactivé'
                                }**`
                            )
                    ],
                    components: []
                })
                .catch(log4js.trace);
        }
        if (metadata.type === 'number') {
            const int = await waitForNumber.process({
                interaction,
                user: interaction.user,
                embed: classic(interaction.user, { question: true })
                    .setTitle(metadata.name)
                    .setDescription(
                        `Sur quelle valeur voulez-vous configurer **${metadata.name}** ?\nRépondez par un nombre dans chat.\nRépondez par \`cancel\` pour annuler`
                    )
            });

            if (int === 'cancel' || int === "time's up")
                return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace);

            client.confs.setConfig(interaction.guild.id, parameter, int as any);
            interaction
                .editReply({
                    embeds: [
                        classic(interaction.user, { accentColor: true })
                            .setTitle('Configuré')
                            .setDescription(
                                `Le paramètre **${metadata.name}** a été configuré sur \`${int.toLocaleString('fr')}\``
                            )
                    ]
                })
                .catch(log4js.trace);
        }
        if (metadata.type === 'string') {
            interaction.reply({
                embeds: [
                    classic(interaction.user, { question: true })
                        .setTitle(metadata.name)
                        .setDescription(
                            `Sur quelle valeur voulez-vous configurer **${metadata.name}** ?\nRépondez dans le chat\nRépondez par \`cancel\` pour annuler`
                        )
                ]
            });
            const str = await waitForMessage({
                channel: interaction.channel as TextChannel,
                user: interaction.user
            }).catch(log4js.trace);

            if (!str || str.content?.toLowerCase() === 'cancel')
                return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace);

            client.confs.setConfig(interaction.guild.id, parameter, str.content as any);
            interaction.editReply({
                embeds: [
                    classic(interaction.user, { accentColor: true })
                        .setTitle(metadata.name)
                        .setDescription(
                            `Le paramètre **${metadata.name}** a été configuré sur \`\`\`${resize(
                                str.content,
                                3000
                            )}\`\`\``
                        )
                ]
            });
        }
        if (metadata.type === 'time') {
            const time = await GetTime.process({
                interaction,
                user: interaction.user,
                embed: classic(interaction.user, { question: true })
                    .setTitle('Temps')
                    .setDescription(`Sur combien de temps voulez configurer **${metadata.name.toLowerCase()}**`)
            });

            if (time === "time's up" || time === 'cancel')
                return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace);

            client.confs.setConfig(interaction.guild.id, parameter, time);

            interaction
                .editReply({
                    embeds: [
                        classic(interaction.user, { accentColor: true })
                            .setTitle('Paramètre configuré')
                            .setDescription(
                                `Le paramètre **${metadata.name.toLowerCase()}** a été configuré sur ${secondsToWeeks(
                                    time,
                                    true
                                )}`
                            )
                    ]
                })
                .catch(log4js.trace);
        }
        if (metadata.type === 'channel[]' || metadata.type === 'user[]') {
            const isUser = metadata.type === 'user[]';
            const data = client.confs.getConfig(interaction.guild.id, parameter) as string[];

            const msg = (await interaction
                .reply({
                    embeds: [
                        classic(interaction.user, { accentColor: true })
                            .setTitle(metadata.name)
                            .setDescription(
                                `Que voulez-vous faire avec le paramètre **${metadata.name.toLowerCase()}** ?`
                            )
                    ],
                    components: [
                        row(
                            buildButton({ label: 'Ajouter', style: 'Success', id: 'add' }),
                            buildButton({
                                label: 'Retirer',
                                style: 'Danger',
                                id: 'remove',
                                disabled: data.length === 0
                            })
                        )
                    ],
                    fetchReply: true
                })
                .catch(log4js.trace)) as Message<true>;

            if (!msg) return;

            const rep = await waitForInteraction({
                componentType: ComponentType.Button,
                user: interaction.user,
                message: msg
            }).catch(log4js.trace);

            if (!rep)
                return interaction
                    .editReply({
                        embeds: [cancel()],
                        components: []
                    })
                    .catch(log4js.trace);

            const dataCache = {
                type: isUser ? 'utilisateur' : 'salon',
                typePrefix: isUser ? "d'utilisateur" : 'de salon',
                typeCPrefix: isUser ? 'cet utilisateur' : 'ce salon',
                ping: isUser ? pingUser : pingChannel
            };
            const process = isUser ? GetUser : GetChannel;
            if (rep.customId === 'add') {
                const actual = client.confs.getConfig(interaction.guild.id, parameter) as string[];

                const value = await process.process({
                    interaction,
                    user: interaction.user,
                    channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum],
                    embed: classic(interaction.user, { question: true })
                        .setTitle(`Ajout ${dataCache.typePrefix}`)
                        .setDescription(
                            `Quel ${
                                dataCache.type
                            } voulez-vous ajouter à **${metadata.name.toLowerCase()}** ?\nRépondez dans le chat par un nom, un identifiant ou une mention\nRépondez par \`cancel\` pour annuler`
                        ),
                    checks: [
                        {
                            check: (c) => !actual.includes(c.id),
                            reply: {
                                embeds: [
                                    classic(interaction.user, { denied: true })
                                        .setTitle(capitalize(dataCache.type) + ' invalide')
                                        .setDescription(
                                            `${
                                                dataCache.typeCPrefix
                                            } est déjà dans le paramètre **${metadata.name.toLowerCase()}**`
                                        )
                                ]
                            }
                        }
                    ]
                });

                if (!value || value === 'cancel' || value === "time's up")
                    return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace);

                actual.push(value.id);
                client.confs.setConfig(interaction.guild.id, parameter, actual);

                interaction
                    .editReply({
                        embeds: [
                            classic(interaction.user, { accentColor: true })
                                .setTitle(`${capitalize(dataCache.type)} ajouté`)
                                .setDescription(
                                    `${dataCache.ping(value.id)} a été ajouté à **${metadata.name.toLowerCase()}**`
                                )
                        ]
                    })
                    .catch(log4js.trace);
            }
            if (rep.customId === 'remove') {
                const actualValue = client.confs.getConfig(interaction.guild.id, parameter) as string[];
                const value = await process.process({
                    interaction,
                    user: interaction.user,
                    channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText, ChannelType.GuildForum],
                    embed: classic(interaction.user, { question: true })
                        .setTitle(`Retrait ${dataCache.typePrefix}`)
                        .setDescription(
                            `Quel ${
                                dataCache.type
                            } voulez-vous retirer de **${metadata.name.toLowerCase()}** ?\nRépondez dans le chat par un nom, un identifiant ou une mention\nRépondez par \`cancel\` pour annuler`
                        ),
                    checks: [
                        {
                            check: (c) => actualValue.includes(c.id),
                            reply: {
                                embeds: [
                                    classic(interaction.user, { denied: true })
                                        .setTitle(`${capitalize(dataCache.type)} invalide`)
                                        .setDescription(
                                            `${capitalize(
                                                dataCache.typeCPrefix
                                            )} n'existe pas dans le paramètre **${metadata.name.toLowerCase()}**`
                                        )
                                ]
                            }
                        }
                    ]
                });

                if (value === 'cancel' || value === "time's up")
                    return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace);

                const actual = (client.confs.getConfig(interaction.guild.id, parameter) as string[]).filter(
                    (x) => x !== value.id
                );
                client.confs.setConfig(interaction.guild.id, parameter, actual);

                interaction
                    .editReply({
                        embeds: [
                            classic(interaction.user, { accentColor: true })
                                .setTitle(`${capitalize(dataCache.type)} retiré`)
                                .setDescription(
                                    `${dataCache.ping(value.id)} a été retiré de **${metadata.name.toLowerCase()}**`
                                )
                        ]
                    })
                    .catch(log4js.trace);
            }
        }
    }
    if (cmd === 'afficher') {
        const parameter = options.getString('paramètre') as undefined | keyof configs<false>;
        if (parameter) {
            const metadata = configsData[parameter];
            const data = client.confs.getConfig(interaction.guild.id, parameter);

            return interaction
                .reply({
                    embeds: [
                        classic(interaction.user, { accentColor: true })
                            .setTitle(metadata.name)
                            .setDescription(
                                resize(
                                    `Le paramètre ${metadata.name} est ${
                                        typeof data === 'boolean'
                                            ? data
                                                ? 'activé'
                                                : 'désactivé'
                                            : typeof data === 'string'
                                            ? `configuré sur \`\`\`${resize(data, 3000)}\`\`\``
                                            : metadata.type === 'channel[]' || metadata.type === 'user[]'
                                            ? (data as string[]).length === 0
                                                ? 'Aucune valeur'
                                                : (data as string[])
                                                      .map(metadata.type === 'user[]' ? pingUser : pingChannel)
                                                      .join(' ')
                                            : metadata.type === 'time'
                                            ? `configuré sur \`${secondsToWeeks(data as number, true)}\``
                                            : `configuré sur \`${(data as number).toLocaleString('fr')}\``
                                    }`,
                                    4096
                                )
                            )
                    ]
                })
                .catch(log4js.trace);
        }
        const embed = classic(interaction.user, { accentColor: true })
            .setTitle('Configurations')
            .setDescription(`Voici les configurations du serveur`);

        Object.keys(client.confs.getConfs(interaction.guild.id))
            .filter((x) => x !== 'guild_id')
            .forEach((key: keyof configs<false>) => {
                const meta = configsData[key];
                const value = client.confs.getConfig(interaction.guild.id, key);

                embed.addFields({
                    name: meta.name,
                    value: resize(
                        typeof value === 'boolean'
                            ? value
                                ? 'activé'
                                : 'désactivé'
                            : typeof value === 'string'
                            ? `\`\`\`${resize(value, 1000)}\`\`\``
                            : meta.type === 'channel[]' || meta.type === 'user[]'
                            ? (value as string[]).length === 0
                                ? 'Aucune valeur'
                                : (value as string[])
                                      .map((x) => (meta.type === 'channel[]' ? pingChannel(x) : pingUser(x)))
                                      .join(' ')
                            : meta.type === 'time'
                            ? `\`${secondsToWeeks(value as number, true)}\``
                            : `\`${(value as number).toLocaleString('fr')}\``,
                        1000
                    ),
                    inline: false
                });
            });

        interaction
            .reply({
                embeds: [embed]
            })
            .catch(log4js.trace);
    }
});
