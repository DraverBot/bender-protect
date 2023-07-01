import { Client, Collection, Guild, GuildMember, User } from "discord.js";
import { Tempban } from "../structures/Tempban";
import { query } from "../utils/query";
import { DatabaseTables, tempbans } from "../typings/database";
import { log4js } from "amethystjs";

export class TempbansManager {
    private _cache: Collection<number, Tempban> = new Collection();
    private client: Client

    constructor(client: Client) {
        this.client = client

        this.init()
    }

    public async tempban({ user, guild, time, deleteMessageCount = 604800, reason = `Auto-sanction by Bender Protect` }: { user: GuildMember; guild: string | Guild; time: number; deleteMessageCount?: number; reason?: string }) {
        const at = Date.now() + time

        if (deleteMessageCount > 604800) deleteMessageCount = 604800;
        user.ban({ reason, deleteMessageSeconds: deleteMessageCount })

        const user_id = user.id;
        const guild_id = typeof guild === 'string' ? guild : guild.id

        const res = await query(`INSERT INTO ${DatabaseTables.Tempban} ( guild_id, user_id, endsAt ) VALUES ('${guild_id}', '${user_id}', '${at}')`)
        const tempban = new Tempban(this.client, {
            endsAt: at,
            guild_id,
            user_id,
            id: res.insertId
        })

        this._cache.set(res.insertId, tempban)
        return tempban
    }
    public exists(id: number) {
        return this._cache.has(id)
    }
    public getBan(id: number) {
        return this._cache.get(id)
    }
    public revoke(id: number) {
        if (!this.exists(id)) return false;
        const ban = this.getBan(id)
        ban.revoke()

        this._cache.delete(id)
        return true
    }
    public makeDef(id: number) {
        if (!this.exists(id)) return false
        const ban = this.getBan(id);
        ban.makeDef()

        this._cache.delete(id)
        return true;
    }
    public list(guild: string) {
        return this._cache.filter(x => x.guild_id === guild)
    }
    public get cache() {
        return this._cache
    }

    private async checkDb() {
        await query(`CREATE TABLE IF NOT EXISTS ${DatabaseTables.Tempban} ( guild_id VARCHAR(255) NOT NULL, user_id VARCHAR(255) NOT NULL, endsAt VARCHAR(255) NOT NULL, id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT )`)
        return true;
    }
    private async fillCache() {
        const data = await query<tempbans>(`SELECT * FROM ${DatabaseTables.Tempban}`)
        if (!data) return log4js.trace('Error while fetching tempbans data')

        data.forEach((x) => {
            this._cache.set(x.id, new Tempban(this.client, {
                ...x,
                endsAt: parseInt(x.endsAt.toString())
            }))
        })
    }
    private async init() {
        await this.checkDb()
        this.fillCache()
    }
}