import { Guild } from 'discord.js';
import { Process } from '../structures/Process';

export default new Process('send error log to owner', async ({}: { guild: Guild; logMessage: string }) => {});
