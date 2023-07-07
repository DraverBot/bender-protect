import { configs } from '../typings/database';

export type configType = 'boolean' | 'string' | 'number' | 'time' | 'user[]' | 'channel[]';
export const configsData: Record<
    keyof configs<true>,
    { name: string; default: string | number | boolean | []; description: string; type: configType }
> = {
    gban: {
        name: 'GBan',
        description: 'Empêche les personnes dans la GBan list de rejoindre le serveur',
        default: true,
        type: 'boolean'
    },
    raidmode: {
        name: 'Raidmode',
        description: "Empêche n'importe qui de rentrer dans le serveur",
        default: false,
        type: 'boolean'
    },
    antispam: {
        name: 'Antispam',
        description: "Active l'antispam",
        default: false,
        type: 'boolean'
    },
    antispam_count: {
        name: "Nombre de messages d'antispam",
        description: "Nombre de messages pendant la durée définie à laquelle doit se déclencher l'antispam",
        default: 10,
        type: 'number'
    },
    antispam_time: {
        name: "Temps de l'antispam",
        description: "Temps à partir duquel doit se déclencher l'antispam",
        type: 'time',
        default: 5000
    },
    antispam_bot: {
        name: 'Antispam-bot',
        description: "L'antispam marche contre les bots",
        type: 'boolean',
        default: true
    },
    antispam_ignored_channels: {
        name: "Salons ignorés de l'antispam",
        description: "Salons que l'antispam ignore",
        type: 'channel[]',
        default: []
    },
    antispam_ignored_users: {
        name: "Utilisateurs ignorés par l'antispam",
        description: "Utilisateurs que l'antispam ignore",
        type: 'user[]',
        default: []
    },
    antispam_mute_time: {
        name: "Temps de mute de l'antispam",
        description: "Temps pendant lequel les utilisateurs sont mutés quand ils sont détectés par l'antispam",
        type: 'time',
        default: 300000
    },
    antispam_delete_messages: {
        name: 'Suppression du spam',
        description: "Supprime les messages qu'un utilisateur a spammé quand il se fait détecter par l'antispam",
        type: 'boolean',
        default: true
    }
};
