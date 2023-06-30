import {
    CommandInteraction,
    ButtonInteraction,
    InteractionReplyOptions,
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    User,
    ComponentType,
    Message,
    Client,
    GuildMember,
    Channel,
    Role
} from 'discord.js';
import perms from '../data/perms.json';
import utils from '../data/utils.json';
import { permType } from '../typings/tools';
import { ButtonIds } from '../typings/client';
import { log4js, waitForInteraction } from 'amethystjs';
import { classic } from './embeds';

export const util = <Key extends keyof typeof utils, Type = (typeof utils)[Key]>(key: Key): Type => {
    return utils[key] as Type;
};
export const systemReply = (
    interaction: CommandInteraction | ButtonInteraction,
    content: InteractionReplyOptions
): Promise<unknown> => {
    const fnt = interaction.replied || interaction.deferred ? 'editReply' : 'reply';
    return (interaction[fnt] as CallableFunction)(content);
};
export const getRolePerm = (key: permType<'role'>) => {
    return perms.role[key];
};
export const getChannelPerm = (key: permType<'channel'>) => {
    return perms.channel[key];
};

export const row = <T extends AnyComponentBuilder>(...components: T[]): ActionRowBuilder<T> =>
    new ActionRowBuilder().setComponents(components) as ActionRowBuilder<T>;
export const buildButton = ({
    label,
    style,
    id,
    buttonId,
    disabled = false,
    url,
    emoji
}: {
    label?: string;
    style: keyof typeof ButtonStyle;
    id?: string;
    buttonId?: keyof typeof ButtonIds;
    url?: string;
    disabled?: boolean;
    emoji?: string;
}) => {
    const btn = new ButtonBuilder({
        style: ButtonStyle[style],
        disabled
    });

    if (label) btn.setLabel(label);
    if (id) btn.setCustomId(id);
    if (buttonId) btn.setCustomId(ButtonIds[buttonId]);
    if (url) btn.setURL(url);
    if (emoji) btn.setEmoji(emoji);

    return btn;
};
export const yesNoRow = () =>
    row(
        buildButton({ label: 'Oui', style: 'Success', buttonId: 'Yes' }),
        buildButton({ label: 'Non', style: 'Danger', buttonId: 'No' })
    );
export const btnId = (id: keyof typeof ButtonIds) => ButtonIds[id];
export const waitForReplies = (client: Client) => ({
    everyone: {
        embeds: [
            classic(client.user, { denied: true })
                .setTitle('Interaction refusée')
                .setDescription(`Vous n'êtes pas autorisé à interagir avec ce message`)
        ],
        ephemeral: true
    },
    user: {
        embeds: [
            classic(client.user, { denied: true })
                .setTitle('Interaction refusée')
                .setDescription(`Vous n'êtes pas autorisé à interagir avec ce message`)
        ],
        ephemeral: true
    }
});
export const confirm = ({
    interaction,
    user,
    time,
    embed,
    ephemeral = false,
    components = [yesNoRow()]
}: {
    interaction: CommandInteraction;
    user: User;
    time?: number;
    embed: EmbedBuilder;
    ephemeral?: boolean;
    components?: ActionRowBuilder<ButtonBuilder>[];
}) => {
    return new Promise<'cancel' | { value: boolean; interaction: ButtonInteraction }>(async (resolve) => {
        let msg: Message<true>;

        if (interaction.replied || interaction.deferred) {
            interaction
                .editReply({
                    embeds: [embed],
                    components: components as ActionRowBuilder<ButtonBuilder>[]
                })
                .catch(() => {});
            msg = (await interaction.fetchReply().catch(() => {})) as Message<true>;
        } else {
            msg = (await interaction
                .reply({
                    embeds: [embed],
                    fetchReply: true,
                    components: components as ActionRowBuilder<ButtonBuilder>[],
                    ephemeral
                })
                .catch(log4js.trace)) as Message<true>;
        }
        if (!msg) return resolve('cancel');

        const reply = await waitForInteraction({
            componentType: ComponentType.Button,
            user,
            message: msg,
            time,
            replies: waitForReplies(interaction.client)
        }).catch(() => {});

        if (!reply) return resolve('cancel');
        return resolve({
            value: reply.customId === btnId('Yes'),
            interaction: reply
        });
    });
};
export const plurial = (nb: number | any[], options?: { singular?: string; plurial?: string }) =>
    (typeof nb === 'number' ? nb : nb.length) === 1 ? options?.singular ?? '' : options?.plurial ?? 's';
export const pingUser = (user: string | User | GuildMember) =>
    typeof user === 'string' ? `<@${user}>` : `<@${user.id}>`;
export const pingChannel = (channel: Channel | string) =>
    typeof channel === 'string' ? `<#${channel}>` : `<#${channel.id}>`;
export const pingRole = (role: Role | string) => (typeof role === 'string' ? `<@&${role}>` : `<@&${role.id}>`);
export const isDraver = (user: User | string) => (typeof user === 'string' ? user : user.id) === process.env.draverId;
