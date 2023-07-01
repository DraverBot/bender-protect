import { configs } from '../typings/database';

export type configType = 'boolean' | 'string' | 'number'
export const configsData: Record<keyof configs<true>, { name: string; default: string | number | boolean; description: string; type: configType }> = {
    gban: {
        name :'GBan',
        description: "Empêche les personnes dans la GBan list de rejoindre le serveur",
        default: true,
        type: 'boolean'
    },
    raidmode: {
        name: 'Raidmode',
        description: "Empêche n'importe qui de rentrer dans le serveur",
        default: false,
        type: 'boolean'
    }
};
