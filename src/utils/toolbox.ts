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
    Role,
    TextBasedChannel,
    MessageCreateOptions,
    DateResolvable,
    BaseChannel
} from 'discord.js';
import perms from '../data/perms.json';
import utils from '../data/utils.json';
import { checkPermsOptions, permType } from '../typings/tools';
import { ButtonIds } from '../typings/client';
import { log4js, waitForInteraction } from 'amethystjs';
import { classic } from './embeds';
import { query } from './query';
import { addModLog as addModLogType } from '../typings/draver';
import * as embeds from '../utils/embeds';

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
export const pingChannel = (channel: BaseChannel | string) =>
    typeof channel === 'string' ? `<#${channel}>` : `<#${channel.id}>`;
export const pingRole = (role: Role | string) => (typeof role === 'string' ? `<@&${role}>` : `<@&${role.id}>`);
export const isDraver = (user: User | string) => (typeof user === 'string' ? user : user.id) === process.env.draverId;
export const isGbanned = async (user: string | User) => {
    const id = typeof user === 'string' ? user : user.id;
    const list = await query<{ user_id: string; reason: string; date: number }>(
        `SELECT * FROM gban_list WHERE user_id="${id}"`,
        'draver'
    );
    if (!list) return false;

    return list.length > 0;
};
export const sqlise = (str: string) => str.replace(/"/g, '\\"');
export const sendAndDelete = async ({
    channel,
    content,
    time = 10000
}: {
    time?: number;
    channel: TextBasedChannel;
    content: MessageCreateOptions;
}) => {
    const msg = await channel.send(content).catch(log4js.trace);
    if (msg) {
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, time);
    }
};
export const resize = (str: string, length = 100) => {
    if (str.length <= length) return str;

    return str.substring(0, length - 3) + '...';
};
export const secondsToWeeks = (time: number, divide?: boolean) => {
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    let days = 0;
    let weeks = 0;
    let years = 0;

    for (let i = 0; i < (!!divide ? Math.floor(time / 1000) : time); i++) {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60) {
            hours++;
            minutes = 0;
        }
        if (hours === 24) {
            hours = 0;
            days++;
        }
        if (days === 7) {
            weeks++;
            days = 0;
        }
        if (weeks === 52) {
            years++;
            weeks = 0;
        }
    }

    const superior = [
        { name: 'seconde', value: seconds },
        { name: 'minute', value: minutes },
        { name: 'heure', value: hours },
        { name: 'jour', value: days },
        { name: 'semaine', value: weeks },
        { name: 'année', value: years }
    ]
        .filter((x) => x.value > 0)
        .reverse();

    const format = [];
    superior.forEach((sup) => {
        format.push(`${sup.value.toLocaleString('fr')} ${sup.name}${plurial(sup.value)}`);
    });
    let str = '';

    format.forEach((v, i, a) => {
        str += v + (a[i + 1] ? (a[i + 2] ? ', ' : ' et ') : '');
    });
    return str;
};
export const removeKey = <T, K extends keyof T>(obj: T, key: K): Omit<T, K> => {
    const { [key]: _, ...rest } = obj;
    return rest;
};
export const addModLog = ({
    guild,
    reason,
    mod_id,
    member_id,
    type,
    proof = ''
}: addModLogType & { member_id: string | null }): Promise<boolean> => {
    return new Promise(async (resolve) => {
        const self = mod_id === guild.client.user.id ? '1' : '0';

        const rs = await query(
            `INSERT INTO modlogs ( guild_id, mod_id, member_id, date, type, reason, proof, autoMod, deleted, edited ) VALUES ( "${
                guild.id
            }", "${mod_id}", "${member_id ?? ''}", "${Date.now()}", "${type}", "${sqlise(
                reason
            )}", "${proof}", "${self}", "0", "0" )`,
            'draver'
        );

        if (!rs) return resolve(false);
        resolve(true);
    });
};
export const checkPerms = ({
    member,
    mod,
    checkBot = false,
    checkClientPosition = true,
    checkModPosition = true,
    checkOwner = true,
    ownerByPass = false,
    checkSelf,
    sendErrorMessage = false,
    interaction = undefined,
    ephemeral = false,
    checkModeratable = true
}: checkPermsOptions) => {
    type replyKey = keyof typeof embeds;
    const send = (key: replyKey): false => {
        if (sendErrorMessage === true && interaction) {
            systemReply(interaction, {
                embeds: [(embeds[key] as (user: User, metadata: any) => EmbedBuilder)(interaction.user, { member })],
                components: [],
                ephemeral
            }).catch(log4js.trace);
        }
        return false;
    };

    const modOwner = mod.id === mod.guild.ownerId;
    if (ownerByPass === true && modOwner) return true;
    if (checkBot && member.user.bot) return send('memberBot');
    if (checkModeratable && !member.moderatable) return send('memberNotModeratable');
    if (checkSelf && member.id === mod.id) return send('selfMod');
    if (checkModPosition && !modOwner && member.roles.highest.position >= mod.roles.highest.position)
        return send('memberTooHigh');
    if (checkClientPosition && member.roles.highest.position >= member.guild.members.me.roles.highest.position)
        return send('memberTooHighClient');
    if (checkOwner && member.id === member.guild.ownerId && !modOwner) return send('memberOwner');
    return true;
};
export const displayDate = (date: DateResolvable, divide?: boolean) => {
    const milliseconds = typeof date === 'number' ? date : typeof date === 'string' ? parseInt(date) : date.getTime();

    let value = milliseconds;
    if (!!divide) value = Math.floor(value / 1000);
    return `<t:${value}:F> ( <t:${value}:R> )`;
};
