import perms from '../data/perms.json';

export type permType<Type extends keyof typeof perms> = keyof (typeof perms)[Type];