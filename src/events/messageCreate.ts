import { AmethystEvent } from "amethystjs";

export default new AmethystEvent('messageCreate', (message) => {
    if (!message.guild || !message.client.confs.getConfig(message.guild.id, 'antispam')) return;
    if (message.author.bot && !message.client.confs.getConfig(message.guild.id, 'antispam_bot')) return;
})