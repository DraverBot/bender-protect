import { If } from 'discord.js';

export enum DatabaseTables {
    Whitelist = 'whitelist',
    DraverModlogs = 'modlogs',
    Sanctions = 'sanctions',
    Tempban = 'tempbans'
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
export enum SanctionName {
    ChannelEdit = 'channeledit',
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
export type sanctionType = 'ban' | 'kick' | 'tempban' | 'downgrade';
export type sanctionDataType<Raw extends boolean> = {
    name: SanctionName;
    sanction: sanctionType;
    time: number | 0;
    enabled: If<Raw, string, boolean>;
};
export type sanctions<Raw extends boolean = false> = {
    guild_id: string;
    sanctions: If<Raw, string, sanctionDataType<Raw>[]>;
};
export type tempbans = {
    guild_id: string;
    user_id: string;
    endsAt: number;
    id: number;
};
