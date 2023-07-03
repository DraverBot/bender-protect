import { AmethystCommand, log4js, preconditions, waitForInteraction, waitForMessage } from 'amethystjs';
import { ApplicationCommandOptionType, ChannelSelectMenuBuilder, ComponentType, Message, StringSelectMenuBuilder, TextChannel, UserSelectMenuBuilder } from 'discord.js';
import { configs } from '../typings/database';
import { configsData } from '../data/configsData';
import { buildButton, confirm, pingChannel, pingUser, resize, row, secondsToWeeks } from '../utils/toolbox';
import { cancel, classic } from '../utils/embeds';
import waitForNumber from '../processes/waitForNumber';
import GetTime from '../processes/GetTime';

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
                embed: classic(interaction.user, { question: true }).setTitle("Temps").setDescription(`Sur combien de temps voulez configurer **${metadata.name.toLowerCase()}**`)
            })

            if (time === "time's up" || time === 'cancel') return interaction.editReply({ embeds: [cancel()] }).catch(log4js.trace)

            interaction.editReply({
                embeds: [classic(interaction.user, { accentColor: true }).setTitle("Paramètre configuré").setDescription(`Le paramètre **${metadata.name.toLowerCase()}** a été configuré sur ${secondsToWeeks(time, true)}`)]
            }).catch(log4js.trace)
        }
        if (metadata.type === 'channel[]' || metadata.type === 'user[]') {
            const isUser = metadata.type === 'user[]';
            const data = client.confs.getConfig(interaction.guild.id, parameter) as string[];

            const msg = await interaction.reply({
                embeds: [ classic(interaction.user, { accentColor: true })
                    .setTitle(metadata.name)
                    .setDescription(`Que voulez-vous faire avec le paramètre **${metadata.name.toLowerCase()}** ?`)
                ],
                components: [ row(buildButton({ label: 'Ajouter', style: 'Success', id: 'add' }), buildButton({ label: 'Retirer', style: 'Danger', id: 'remove', disabled: data.length === 0 })) ],
                fetchReply: true
            }).catch(log4js.trace) as Message<true>

            if (!msg) return;

            const rep = await waitForInteraction({
                componentType: ComponentType.Button,
                user: interaction.user,
                message: msg
            }).catch(log4js.trace)

            if (!rep) return interaction.editReply({
                embeds: [cancel()],
                components: []
            }).catch(log4js.trace);

            if (rep.customId === 'remove') {
                
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
                                `Le paramètre ${metadata.name} est ${
                                    typeof data === 'boolean'
                                        ? data
                                            ? 'activé'
                                            : 'désactivé'
                                        : typeof data === 'string'
                                        ? `configuré sur \`\`\`${resize(data, 3000)}\`\`\``
                                        : metadata.type === 'channel[]' || metadata.type === 'user[]'
                                        ? (data as string[]).map(metadata.type === 'user[]' ? pingUser : pingChannel).join(' ')
                                        : `configuré sur \`${(data as number).toLocaleString('fr')}\``
                                }`
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
