import { AmethystEvent, log4js } from 'amethystjs';
import { spams } from '../data/maps';
import { Collection, GuildMember, Message } from 'discord.js';
import { addModLog, displayDate, hasDiscordLink, hasLink, pingUser, secondsToWeeks } from '../utils/toolbox';
import { classic } from '../utils/embeds';

export default new AmethystEvent('messageCreate', async (message) => {
    if (!message.guild) return;
    
    const client = message.client;
    const configs = client.confs.getConfs(message.guild.id);

    if (configs.antilink && !configs.antilink_ignored_channels.includes(message.channel.id) && !configs.antilink_ignored_users.includes(message.author.id)) {
        const res = configs.antilink_discord_invites ? hasDiscordLink(message?.content ?? '') : hasLink(message?.content ?? '');

        if (res) {
            message.delete().catch(log4js.trace)
            message.channel.send({
                content: `${pingUser(message.author)}`,
                embeds: [ classic(message.author, { mod: true }).setTitle("Message supprimé") ]
            })
        }
    }
    
    if (message.author.bot && !configs.antispam_bot) return;
    if (client.whitelist.isWhitelisted(message.guild, message.author.id)) return;
    if (
        !configs.antispam ||
        (!configs.antispam_bot && message.author.bot) ||
        configs.antispam_ignored_channels.includes(message.channel.id) ||
        configs.antispam_ignored_users.includes(message.author.id)
    )
        return;

    const code = `${message.guild.id}.${message.author.id}`;
    const exists = spams.has(code);

    const data = (spams.get(code) ?? 0) + 1;

    spams.set(code, data);
    if (!exists) {
        setTimeout(() => {
            spams.delete(code);
        }, configs.antispam_time);
    } else {
        if (data >= configs.antispam_count) {
            const member = message.member as GuildMember;
            if (configs.antispam_delete_messages) {
                message.channel.messages
                    .fetch()
                    .catch(() => {})
                    .then(async (messages: void | Collection<string, Message<boolean>>) => {
                        if (!messages) return;

                        const toDelete = messages
                            .filter((x) => x.author.id === message.author.id)
                            .toJSON()
                            .splice(0, configs.antispam_count);
                        if (message.channel.isTextBased() && !message.channel.isDMBased()) {
                            message.channel.bulkDelete(toDelete).catch(() => {});
                        }
                    });
            }
            if (member.moderatable) {
                const end = Date.now() + configs.antispam_mute_time;
                member.timeout(configs.antispam_mute_time, `Spam`);
                message.channel
                    .send({
                        content: pingUser(message.author),
                        embeds: [
                            classic(message.author, { mod: true })
                                .setTitle('Réduction au silence')
                                .setDescription(
                                    `Je vous ai muté, car vous avez dépassé la limite de messages autorisés en **${secondsToWeeks(
                                        configs.antispam_time,
                                        true
                                    )}**.\nVous serez démuté ${displayDate(end, true)}`
                                )
                        ]
                    })
                    .catch(log4js.trace);

                addModLog({
                    guild: message.guild,
                    member_id: member.id,
                    mod_id: client.user.id,
                    type: 'Mute',
                    reason: `Action d'antispam ( ${configs.antispam_count} messages en ${secondsToWeeks(
                        configs.antispam_time,
                        true
                    )} )`
                }).catch(() => {});
            }
        }
    }
});
