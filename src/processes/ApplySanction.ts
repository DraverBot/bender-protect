import { Guild, GuildMember, User } from "discord.js";
import { Process } from "../structures/Process";
import { SanctionType } from "../typings/database";

export default new Process('apply sanction', async({  }: { guild: Guild; user: User | GuildMember; sanction: keyof typeof SanctionType }) => {})