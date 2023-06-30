import { AmethystEvent, commandDeniedCode, log4js } from 'amethystjs';
import { systemReply } from '../utils/toolbox';
import {
    DMOnly,
    clientMissingPerm,
    cooldown,
    guildOnly,
    needWhitelist,
    ownerOnly,
    userMissingPerm
} from '../utils/embeds';

export default new AmethystEvent('commandDenied', (command, reason) => {
    if (reason.code === 'precondition.whitelist') {
        return systemReply(command.interaction, {
            embeds: [needWhitelist(command.user)],
            ephemeral: true
        }).catch(log4js.trace);
    }
    if (reason.code === commandDeniedCode.GuildOnly)
        return systemReply(command.interaction, {
            embeds: [guildOnly(command.interaction.user)],
            ephemeral: true
        }).catch(log4js.trace);
    if (reason.code === commandDeniedCode.DMOnly)
        return systemReply(command.interaction, { embeds: [DMOnly(command.interaction.user)], ephemeral: true }).catch(
            log4js.trace
        );
    if (reason.code === commandDeniedCode.UserMissingPerms)
        return systemReply(command.interaction, {
            embeds: [userMissingPerm(command.interaction.user, reason.metadata.permissions.missing)],
            ephemeral: true
        }).catch(log4js.trace);
    if (reason.code === commandDeniedCode.ClientMissingPerms)
        return systemReply(command.interaction, {
            embeds: [clientMissingPerm(command.interaction.user, reason.metadata.permissions.missing)],
            ephemeral: true
        }).catch(log4js.trace);
    if (reason.code === commandDeniedCode.OwnerOnly)
        return systemReply(command.interaction, {
            embeds: [ownerOnly(command.interaction.user)],
            ephemeral: true
        }).catch(log4js.trace);
    if (reason.code === commandDeniedCode.UnderCooldown)
        return systemReply(command.interaction, {
            embeds: [cooldown(command.interaction.user, reason.metadata.remainingCooldownTime)],
            ephemeral: true
        }).catch(log4js.trace);
});
