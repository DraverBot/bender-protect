import { Guild, GuildMember, User } from "discord.js";
import { Process } from "../structures/Process";
import { SanctionName } from "../typings/database";

export default new Process('apply sanction', async({  }: { guild: Guild; user: User | GuildMember; sanction: keyof typeof SanctionName }) => {})