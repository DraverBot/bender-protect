import { AmethystEvent } from "amethystjs";
import { gbanned, raidmode } from "../utils/embeds";
import { isGbanned } from "../utils/toolbox";

export default new AmethystEvent('guildMemberAdd', async(member) => {
    const guild = member.guild;
    const client = member.client;

    if (client.confs.getConfig(guild.id, 'raidmode')) {
        await member.send({ embeds: [ raidmode(member.user, guild) ] }).catch(() => {});
        return member.kick('Raidmode').catch(() => {})
    }
    if (client.confs.getConfig(guild.id, 'gban') && await isGbanned(member.id)) {
        await member.send({ embeds: [gbanned(member.user, guild)] }).catch(() => {})        
        return member.ban({ reason: "User GBanned" })
    }
})