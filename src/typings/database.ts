import { If } from 'discord.js';

export enum DatabaseTables {
    Whitelist = 'whitelist',
    DraverModlogs = 'modlogs'
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
};
export enum SanctionType {
    ChannelEdit = "channeledit",
    ChannelCreate = 'channelcreate',
    ChannelDelete = 'channeldelete',
    Ban = 'ban',
    Unban = 'unban',
    Mute = 'mute',
    unmute = 'unmute',
    kick = 'kick',
    roleCreate = 'rolecreate',
    roleEdit = 'roleedit',
    roleDelete = 'roledelete',
    serverEdit = 'serverEdit',
    memberEdit = 'memberEdit'
}
