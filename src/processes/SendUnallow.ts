import { Guild, User } from "discord.js";
import { Process } from "../structures/Process";
import { unAllowedAction } from "../utils/embeds";

export default new Process('Send unallowed message', async(user: User | void, guild: Guild) => {
    if (user) user.send({
        embeds:[unAllowedAction(user, guild)]
    }).catch(() => {});
})