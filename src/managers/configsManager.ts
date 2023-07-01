import { Collection } from 'discord.js';
import { DatabaseTables, configs, configsDb } from '../typings/database';
import { query } from '../utils/query';
import { log4js } from 'amethystjs';
import { configsData } from '../data/configsData';
import { sqlise } from '../utils/toolbox';

export class ConfigsManager {
    private cache: Collection<string, configsDb> = new Collection();

    constructor() {
        this.init();
    }

    public getDefaultConfigs(guild: string): configsDb {
        const configs = {
            guild_id: guild
        }
        Object.keys(configsData).forEach((x: keyof typeof configsData) => configs[x] = configsData[x].default)

        return configs as configsDb
    }
    public getConfs(guild: string) {
        return this.cache.get(guild) ?? this.getDefaultConfigs(guild)
    }
    public setConfig<Key extends keyof configs<false>>(guild: string, config: Key, state: configs<false>[Key]) {
        const data = this.getConfs(guild);
        data[config] = state;

        this.cache.set(data.guild_id, data);
        const mysqlData = typeof state === 'boolean' ? (state ? '1' : '0') : typeof state === 'string' ? sqlise(state) : state;

        query(`UPDATE ${DatabaseTables.Configs} SET ${config}="${mysqlData}"`)
    }
    public getConfig<Key extends keyof configs<false>>(guild: string, key: Key): configs<false>[Key] {
        return this.getConfs(guild)[key]
    }

    private bool(inp: string): boolean {
        return inp === '1';
    }
    private async fillCache() {
        const data = await query<configsDb<true>>(`SELECT * FROM ${DatabaseTables.Configs}`);
        if (!data) return log4js.trace('No data for configs fetch');

        data.forEach((x) => {
            this.cache.set(x.guild_id, {
                ...x,
                gban: this.bool(x.gban),
                raidmode: this.bool(x.raidmode)
            });
        });
    }
    private async checkDb() {
        await query(`CREATE TABLE IF NOT EXISTS ${DatabaseTables.Configs} ( guild_id VARCHAR(255) NOT NULL PRIMARY KEY, gban TINYINT(1) NOT NULL DEFAULT '1', raidmode TINYINT(1) NOT NULL DEFAULT '0' )`)
        return true
    }
    private async init() {
        await this.checkDb()
        this.fillCache()
    }
}
