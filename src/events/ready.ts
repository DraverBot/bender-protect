import { AmethystEvent } from 'amethystjs';
import { WhitelistManager } from '../managers/whitelist';
import { ActivityType } from 'discord.js';

export default new AmethystEvent('ready', (client) => {
    client.user.setActivity({
        name: 'Vos serveur',
        type: ActivityType.Watching
    });
    client.whitelist = new WhitelistManager();
});

declare module 'discord.js' {
    interface Client {
        whitelist: WhitelistManager;
    }
}
