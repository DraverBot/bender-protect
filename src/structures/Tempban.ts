import { Client, Guild } from 'discord.js';
import { DatabaseTables, tempbans } from '../typings/database';
import { log4js } from 'amethystjs';
import { query } from '../utils/query';

export class Tempban {
    private client: Client;
    private _userId: string;
    private guild: Guild;
    private _guild_id: string;
    private _endsAt: number;
    private timeout: NodeJS.Timeout;
    private _id: number;

    constructor(client: Client, options: tempbans) {
        this.client = client;
        this._userId = options.user_id;
        this.guild = client.guilds.cache.get(options.guild_id);
        this._guild_id = options.guild_id;
        this._endsAt = options.endsAt;
        this._id = options.id;

        this.init();
    }
    public get at() {
        return this._endsAt;
    }
    public get id() {
        return this._id;
    }
    public get guild_id() {
        return this._guild_id;
    }
    public get user_id() {
        return this._userId;
    }

    public revoke() {
        this.delete();
        if (this.guild) {
            this.guild.members.unban(this._userId).catch(log4js.trace);
        }
    }
    public makeDef() {
        this.delete();
        clearTimeout(this.timeout);
        delete this.timeout;
    }
    private delete() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }
        query(`DELETE FROM ${DatabaseTables.Tempban} WHERE id='${this._id}'`);
    }
    private async init() {
        if (!this.guild) {
            await this.client.guilds.fetch().catch(() => {});
            this.guild = this.client.guilds.cache.get(this._guild_id);
            if (!this.guild) return log4js.trace(`No guild`);
        }

        if (this._endsAt <= Date.now()) return this.revoke();
        this.timeout = setTimeout(() => {
            this.revoke();
        }, this._endsAt - Date.now());
    }
}
