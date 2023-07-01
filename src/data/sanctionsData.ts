import { SanctionName, sanctionDataType, sanctionType } from '../typings/database';

export const sanctionsData: Record<
    SanctionName,
    { default: sanctionType; time: number; name: string; enabled: boolean }
> = {
    ban: {
        default: 'downgrade',
        time: 0,
        name: 'Bannissement',
        enabled: true
    },
    channelcreate: {
        default: 'downgrade',
        time: 0,
        name: 'Création de salon',
        enabled: true
    },
    channeldelete: {
        default: 'downgrade',
        time: 0,
        name: 'Suppression de salon',
        enabled: true
    },
    channeledit: {
        default: 'downgrade',
        time: 0,
        name: 'Modification de salon',
        enabled: true
    },
    kick: {
        name: 'Expulsion',
        time: 0,
        default: 'downgrade',
        enabled: true
    },
    memberEdit: {
        name: 'Modification de membre',
        time: 0,
        default: 'downgrade',
        enabled: true
    },
    mute: {
        name: 'Réduction au silence',
        time: 0,
        default: 'downgrade',
        enabled: true
    },
    rolecreate: {
        name: 'Création de rôle',
        default: 'downgrade',
        time: 0,
        enabled: true
    },
    roledelete: {
        name: 'Suppression de rôle',
        default: 'downgrade',
        time: 0,
        enabled: true
    },
    roleedit: {
        name: 'Modification de rôle',
        default: 'downgrade',
        time: 0,
        enabled: true
    },
    serverEdit: {
        name: 'Modification du serveur',
        default: 'kick',
        time: 0,
        enabled: true
    },
    unban: {
        name: 'Débannissement',
        default: 'downgrade',
        time: 0,
        enabled: true
    },
    unmute: {
        name: 'Rétablissement de la voix',
        default: 'downgrade',
        time: 0,
        enabled: true
    }
};
export const sanctionTypeData: Record<sanctionType, { name: string; time: boolean }> = {
    kick: {
        name: 'Expulsion',
        time: false
    },
    ban: {
        name: 'Bannissement',
        time: false
    },
    downgrade: {
        time: false,
        name: 'Dégradage'
    },
    tempban: {
        name: 'Bannissement temporaire',
        time: true
    }
};
