import { AmethystCommand, log4js, preconditions } from "amethystjs";
import whitelisted from "../preconditions/whitelisted";
import { ApplicationCommandOptionType, ChannelType, GuildBasedChannel, GuildChannel, TextChannel } from "discord.js";
import { addModLog, confirm, displayDate, pingChannel, pingUser } from "../utils/toolbox";
import { cancel, classic, wait } from "../utils/embeds";
import waitForConfirm from "../processes/waitForConfirm";

export default new AmethystCommand({
    name: 'nuke',
    description: "Nettoie entièrement un salon",
    preconditions: [preconditions.GuildOnly, whitelisted],
    permissions: ['Administrator'],
    options: [
        {
            name: 'salon',
            description: "Salon que vous voulez nettoyer",
            type: ApplicationCommandOptionType.Channel,
            required: true,
            channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread]
        },
        {
            name: 'raison',
            description: "Raison du nettoyage",
            required: false,
            type: ApplicationCommandOptionType.String,
            maxLength: 256
        }
    ],
    clientPermissions: ['ManageChannels']
}).setChatInputRun(async({ interaction, options, client }) => {
    const channel = options.getChannel('salon', true, [ ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildText, ChannelType.PrivateThread, ChannelType.PublicThread ]) as GuildChannel;
    const reason = options.getString('raison') ?? "Pas de raison";

    if (channel.id === interaction.channel.id) return interaction.reply({
        embeds: [ classic(interaction.user, { denied: true }).setDescription(`Vous ne pouvez pas supprimer ce salon, car c'est celui dans lequel la commande est exécutée.\nSi vous voulez nettoyer ce salon, veuillez exécuter la commande dans un autre salon`).setTitle("Nettoyage impossible") ]
    }).catch(log4js.trace)
    if (!channel.deletable) return interaction.reply({
        embeds: [ classic(interaction.user, { denied: true }).setDescription(`Je ne peux pas supprimer le salon ${pingChannel(channel)}`).setTitle("Salon non-supprimable") ]
    }).catch(log4js.trace)
    
    const confirmation = await confirm({
        interaction,
        user: interaction.user,
        embed: classic(interaction.user, { question: true }).setTitle("Nettoyage").setDescription(`Vous êtes sur le point de supprimer le salon ${pingChannel(channel)} ?\nLe salon sera supprimé, puis recréé.\nÊtes vous sûr de vouloir continuer ? Si des bots ont des configurations sur ce salon, vous devrez les reconfigurer.`)
    }).catch(log4js.trace)

    if (!confirmation || confirmation === 'cancel' || !confirmation?.value) return interaction.editReply({ embeds: [ cancel() ], components: [] }).catch(log4js.trace)

    await interaction.editReply({
        embeds: [ classic(interaction.user, { question: true }).setTitle("Nettoyage").setDescription(`Le salon ${pingChannel(channel)} va être nettoyé ${displayDate(Date.now() + 5000, true)}, sauf si une personne whitelistée annule avant (envoyez \`cancel\` dans le chat pour annuler)`) ],
        components: []
    }).catch(log4js.trace)

    const nukeConfirm = await waitForConfirm.process({ channel: interaction.channel as TextChannel, time: 5000 });

    if (nukeConfirm.canceled) return interaction.editReply({ embeds: [ classic(interaction.user, { accentColor: true }).setTitle("Nettoyage annulé").setDescription(`${pingUser(nukeConfirm.user)} a annulé le nettoyage`) ] }).catch(log4js.trace);

    await interaction.editReply({
        embeds: [ wait(interaction.user) ]
    }).catch(log4js.trace)

    const clone = await interaction.guild.channels.create({
        ...(channel.toJSON() as object),
        permissionOverwrites: channel.permissionOverwrites.cache,
        name: channel.name,
        reason
    }).catch(log4js.trace)

    if (!clone) return interaction.editReply({
        embeds: [ classic(interaction.user, { denied: true }).setTitle("Nettoyage échoué").setDescription(`Je n'ai pas pu cloner ${pingChannel(channel)}.\nVeuillez vérifier que je possède toutes les permissions avant de réessayer`) ]
    })
    const deleteRes = await channel.delete().catch(log4js.trace)
    if (!deleteRes) {
        clone.delete().catch(log4js.trace)
        return interaction.editReply({ embeds: [ classic(interaction.user, { denied: true }).setTitle("Nettoyage échoué").setDescription(`Je n'ai pas pu supprimer le salon ${pingChannel(channel)}`) ] }).catch(log4js.trace)
    }

    if (channel.parent) await clone.setParent(channel.parent, {reason}).catch(log4js.trace)
    await clone.setPosition(channel.position, { relative: true, reason }).catch(log4js.trace)

    if (clone.isTextBased()) {
        clone.send({
            embeds: [ classic(interaction.user, { accentColor: true }).setTitle("Nettoyage").setDescription(`Salon nettoyé par ${pingUser(interaction.user)}`) ]
        }).catch(log4js.trace)
    }
    addModLog({
        guild: interaction.guild,
        member_id: '',
        mod_id: interaction.user.id,
        reason: reason + ` ( salon ${clone.name} nettoyé )`,
        type: 'Nuke'
    }).catch(log4js.trace)
    interaction.editReply({
        embeds: [ classic(interaction.user, { accentColor: true }).setTitle("Nettoyage effectué").setDescription(`Le salon ${pingChannel(clone)} a été correctement nettoyé`) ]
    }).catch(log4js.trace)
})