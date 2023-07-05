import { Guild } from 'discord.js';

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
export enum modActionType {
    Mute = 'Réduction au silence',
    Unmute = 'Retrait de réduction au silence',
    Ban = 'Bannissement',
    Unban = 'Débannissement',
    Kick = 'Expulsion',
    Warn = 'Avertissement',
    Unwarn = "Retrait d'avertissement",
    EditLog = 'Modification de log',
    CoinsReset = 'Réinitialisation économique',
    CoinsAdd = 'Ajout économique',
    CoinsRemove = 'Retrait économique',
    LogDeletion = 'Suppression de log',
    LevelReset = 'Réinitialisation de niveaux',
    CouponCreated = 'Coupon crée',
    CouponClaimed = 'Coupon utilisé',
    CouponDeleted = 'Coupon supprimé',
    Rename = 'Changement de pseudo',
    NoteModified = 'Note modifiée',
    NoteAdded = 'Note ajoutée',
    NoteRemoved = 'Note retirée',
    JoinRoleSet = "Rôle d'arrivée configuré",
    JoinRoleRemoved = "Rôle d'arrivée supprimé",
    ChannelCreate = 'création de salon',
    ChannelDelete = 'suppression de salon',
    ChannelEdit = 'Modification de salon',
    WebhookCreationFailed = 'Échec de création de webhook',
    RoleCreate = 'Création de rôle',
    RoleEdit = 'Modification de rôle',
    RoleDelete = 'Supression de rôle',
    MessageBulkDelete = 'Suppression de messages',
    Censor = 'Censuration',
    Tempban = 'Bannissement temporaire',
    Nuke = 'Nettoyage de salon',
    Demote = 'Destitution'
}
export type addModLog = {
    guild: Guild;
    reason: string;
    member_id: string;
    mod_id: string;
    type: keyof typeof modActionType;
    /**
     * Image URL
     *
     * Can be null
     */
    proof?: string;
};
