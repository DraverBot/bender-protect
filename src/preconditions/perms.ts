import { Precondition } from "amethystjs";
import { GuildMember } from "discord.js";
import { checkPerms } from "../utils/toolbox";

export default new Precondition('checkPerms').setChatInputRun(({ interaction, options, client }) => {
    const member = options.getMember('utilisateur') as GuildMember;

    if (!member) return { ok: true, interaction, type: 'chatInput' }
    if (!checkPerms({
        member,
        mod: interaction.member as GuildMember,
        checkBot: false,
        checkClientPosition: true,
        checkModeratable: true,
        checkOwner: true,
        checkModPosition: true,
        checkSelf: true,
        sendErrorMessage: true,
        interaction
    })) return {
        ok: false,
        interaction,
        type: 'chatInput',
        metadata: {
            silent: true
        }
    }

    return {
        ok: true,
        type: 'chatInput',
        interaction
    }
})