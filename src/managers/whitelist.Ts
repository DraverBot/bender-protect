import { Collection, Guild } from "discord.js";
import { DatabaseTables, whitelist } from '../typings/database'
import { query } from '../utils/query'
import { log4js } from "amethystjs";

export class WhitelistManager {
    private cache: Collection<string, whitelist> = new Collection()

    constructor() {
        this.init()
    }

    public getList(guild_id: string) {
        return this.cache.get(guild_id)?.whitelist ?? []
    }
    public isWhitelisted(guild: Guild, userId: string) {
        if (userId === guild.ownerId) return true;
        return this.getList(guild.id).includes(userId)
    }
    public addUser(guild: Guild, userId: string) {
        if (this.isWhitelisted(guild, userId)) return false
        const list = this.getList(guild.id)
        list.push(userId)
        this.cache.set(guild.id, { guild_id: guild.id, whitelist: list })

        query(`INSERT INTO ${DatabaseTables.Whitelist} (guild_id, whitelist) VALUES ('${guild.id}', '${JSON.stringify(list)}') ON DUPLICATE KEY UPDATE whitelist='${JSON.stringify(list)}'`)
        return true
    }
    public removeUser(guild: Guild, userId: string) {
        if (!this.isWhitelisted(guild, userId) || userId === guild.ownerId) return false
        const list = this.getList(guild.id).filter(x => x !== userId)

        this.cache.set(guild.id, { guild_id: guild.id, whitelist: list })
        query(`UPDATE ${DatabaseTables.Whitelist} SET whitelist='${JSON.stringify(list)}' WHERE guild_id='${guild.id}'`)
        return true
    }
    private async fillCache() {
        const data = await query<whitelist<true>>(`SELECT * FROM ${DatabaseTables.Whitelist}`)
        if (!data) return log4js.trace(`No data in whitelist table`)

        data.forEach((x) => {
            this.cache.set(x.guild_id, {
                ...x,
                whitelist: JSON.parse(x.whitelist)
            })
        })
    }
    private async checkDb() {
        await query(`CREATE TABLE IF NOT EXISTS ${DatabaseTables.Whitelist} ( guild_id VARCHAR(255) NOT NULL PRIMARY KEY, whitelist LONGTEXT )`)
        return true
    }
    private async init( ) {
        await this.checkDb();
        this.fillCache()
    }
}