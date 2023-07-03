import { AmethystClient } from 'amethystjs';
import { Partials } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new AmethystClient(
    {
        intents: [
            'Guilds',
            'GuildBans',
            'GuildEmojisAndStickers',
            'GuildModeration',
            'GuildWebhooks',
            'GuildMembers',
            'GuildMessages',
            'MessageContent'
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Message]
    },
    {
        commandsFolder: './dist/commands',
        eventsFolder: './dist/events',
        buttonsFolder: './dist/buttons',
        autocompleteListenersFolder: './dist/autocompletes',
        preconditionsFolder: './dist/preconditions',
        debug: true,
        token: process.env.token,
        strictPrefix: true
    }
);

client.start({});
