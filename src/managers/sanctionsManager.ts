import { Collection } from 'discord.js';
import { DatabaseTables, SanctionName, sanctionDataType, sanctionType, sanctions } from '../typings/database';
import { query } from '../utils/query';
import { sanctionsData } from '../data/sanctionsData';
import { log4js } from 'amethystjs';

export class SanctionManager {
    private cache: Collection<string, sanctions> = new Collection();

    constructor() {
        this.init();
    }

    public getSanction(guildId: string, sanction: SanctionName) {
        return this.getList(guildId).find((x) => x.name === sanction);
    }
    public getList(guildId: string): sanctionDataType<false>[] {
        return (
            this.cache.get(guildId)?.sanctions ??
            Object.keys(sanctionsData).map((x: keyof typeof sanctionsData) => ({
                name: SanctionName[x],
                enabled: sanctionsData[x].enabled,
                sanction: sanctionsData[x].default,
                time: sanctionsData[x].time
            }))
        );
    }
    public setSanction(
        guildId: string,
        sanction: { name: SanctionName; type: sanctionType; time: number; enabled: boolean }
    ) {
        const list = this.getList(guildId);
        const index = list.indexOf(this.getSanction(guildId, sanction.name));

        list[index] = {
            name: sanction.name,
            enabled: sanction.enabled,
            time: sanction.time,
            sanction: sanction.type
        };

        this.cache.set(guildId, { guild_id: guildId, sanctions: list });
        this.update(guildId);
    }

    private update(guild: string) {
        return query(
            `UPDATE ${DatabaseTables.Sanctions} SET sanctions='${JSON.stringify(
                this.getList(guild)
            )}' WHERE guild_id='${guild}'`
        );
    }
    private async checkDb() {
        await query(
            `CREATE TABLE IF NOT EXISTS ${
                DatabaseTables.Sanctions
            } ( guild_id VARCHAR(255) NOT NULL PRIMARY KEY, ${Object.keys(sanctionsData)
                .map((x) => `${x} LONGTEXT`)
                .join(', ')} )`
        );

        return;
    }
    private async fillCache() {
        const data = await query<sanctions<true>>(`SELECT * FROM ${DatabaseTables.Sanctions}`);
        if (!data) return log4js.trace('No data for sanction manager');

        data.forEach((x) => {
            this.cache.set(x.guild_id, JSON.parse(x.sanctions));
        });
    }
    private async init() {
        await this.checkDb();
        this.fillCache();
    }
}
