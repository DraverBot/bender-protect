import { If } from "discord.js";

export enum DatabaseTables {
    Whitelist = 'whitelist'
}
export type DefaultQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
export type QueryResult<T> = T extends DefaultQueryResult ? DefaultQueryResult : T[];
export type whitelist<Raw extends boolean = false> = {
    guild_id: string;
    whitelist: If<Raw, string, string[]>;
}