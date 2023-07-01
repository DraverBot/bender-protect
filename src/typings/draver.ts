export type BenderAPIType =
    | 'Mute'
    | 'Unmute'
    | 'Ban'
    | 'Unban'
    | 'Kick'
    | 'Rename'
    | 'ChannelCreate'
    | 'ChannelDelete'
    | 'ChannelEdit'
    | 'RoleCreate'
    | 'RoleDelete'
    | 'RoleEdit'
    | 'Censor'
    | 'RoleAdded'
    | 'RoleRemoved';

type BenderAPIOptionsData<T extends BenderAPIType> = T extends 'Unmute'
    ? { remainingTimeInMs: number; member: string }
    : T extends 'Kick' | 'Mute'
    ? { member: string }
    : T extends 'Censor' | 'Rename'
    ? { oldName: string; member: string }
    : T extends 'ChannelEdit' | 'RoleEdit'
    ? { before: any; after: any }
    : T extends 'RoleCreate' | 'ChannelCreate'
    ? { id: string }
    : T extends 'RoleDelete' | 'ChannelDelete'
    ? { value: any; permissions: any }
    : T extends 'RoleAdded' | 'RoleRemoved'
    ? { member: string; role: string }
    : T extends 'Ban' | 'Unban'
    ? { member: string }
    : never;

export type BenderAPIOptions<T extends BenderAPIType> = {
    type: T;
    guild: string;
    user: string;
    data: BenderAPIOptionsData<T>;
};
