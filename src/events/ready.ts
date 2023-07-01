import { AmethystEvent, DebugImportance, log4js } from 'amethystjs';
import { WhitelistManager } from '../managers/whitelist';
import { ActivityType, User } from 'discord.js';
import { DraverAPIListener } from '../structures/APIListener';
import { BenderAPIOptions, BenderAPIType } from '../typings/draver';
import { readdirSync } from 'fs';
import express from 'express';
import { SanctionManager } from '../managers/sanctionsManager';
import { TempbansManager } from '../managers/tempbansManager';
import { ConfigsManager } from '../managers/configsManager';

const app = express();
app.use(express.json());

export default new AmethystEvent('ready', (client) => {
    client.user.setActivity({
        name: 'Vos serveur',
        type: ActivityType.Watching
    });
    client.whitelist = new WhitelistManager();
    client.sanctions = new SanctionManager();
    client.tempbans = new TempbansManager(client);
    client.confs = new ConfigsManager();

    const listeners: DraverAPIListener<BenderAPIType>[] = [];

    readdirSync('./dist/listeners').forEach((name) => {
        const path = `../listeners/${name}`;
        const listener: DraverAPIListener<BenderAPIType> = require(path)?.default ?? require(path);

        if (!listener || !(listener instanceof DraverAPIListener))
            return client.debug(`Default value of ${path} is not a Draver API Listener`, DebugImportance.Error);
        listeners.push(listener);
    });

    client.guilds.fetch().catch(() => {});

    app.post(`/actions`, async (req, res) => {
        res.sendStatus(200);

        const data = req.body as BenderAPIOptions<BenderAPIType>;
        const listener = listeners.find((x) => x.keys.includes(data.type));

        const guild = client.guilds.cache.get(data.guild);
        const user = (client.users.cache.get(data.user) ??
            (await client.users.fetch(data.user).catch(() => {})) ??
            guild?.members?.cache?.get(data.user)?.user) as User;

        if (!guild) return;

        if (!listener) return client.debug(`No listener found for ${data.type}`, DebugImportance.Error);
        listener.run({
            type: data.type,
            userId: data.user,
            user,
            guildId: data.guild,
            guild,
            client,
            data: data.data
        });
    });

    app.listen(process.env.draver_port);
});

declare module 'discord.js' {
    interface Client {
        whitelist: WhitelistManager;
        sanctions: SanctionManager;
        tempbans: TempbansManager;
        confs: ConfigsManager;
    }
}
