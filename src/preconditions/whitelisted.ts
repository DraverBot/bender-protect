import { Precondition } from 'amethystjs';

export default new Precondition('whitelisted').setChatInputRun(({ interaction }) => {
    if (!interaction.client.whitelist.isWhitelisted(interaction.guild, interaction.user.id))
        return {
            ok: false,
            type: 'chatInput',
            interaction,
            code: 'precondition.whitelist'
        };

    return {
        ok: true,
        type: 'chatInput',
        interaction
    };
});
