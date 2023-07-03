import { ColorResolvable, EmbedBuilder, Guild, GuildMember, PermissionsString, User } from 'discord.js';
import { getRolePerm, pingUser, util } from './toolbox';

const base = (
    user: User,
    options?: {
        accentColor?: boolean;
        denied?: boolean;
        iconOption?: 'user' | 'client';
        footerText?: 'user' | 'client';
        question?: boolean;
    }
) => {
    const embed = new EmbedBuilder({
        footer: {
            text: ((options?.footerText ?? 'user') === 'user' ? user : user.client.user).username,
            iconURL: ((options?.iconOption ?? 'client') === 'client' ? user.client.user : user).displayAvatarURL({
                forceStatic: true
            })
        },
        timestamp: Date.now()
    });

    if (!!options?.accentColor) embed.setColor(util('accentColor'));
    if (!!options?.denied) embed.setColor('#ff0000');
    if (!!options?.question) embed.setColor(util('colorQuestion') as ColorResolvable);

    return embed;
};
export const denied = (user: User) => base(user, { denied: true })

export const classic = base;
export const needWhitelist = (user: User) =>
    denied(user)
        .setTitle('Whitelist')
        .setDescription(`Cette commande est réservée aux personnes whitelistées sur le serveur`);
export const ownerOnly = (user: User) =>
    denied(user)
        .setTitle('Propriétaire seulement')
        .setDescription(`Cette commande est réservée au propriétaire du serveur`);
export const userMissingPerm = (user: User, missing: PermissionsString[]) =>
    denied(user)
        .setTitle('Permission manquante')
        .setDescription(
            `Vous n'avez pas ${
                missing.length === 1
                    ? `la permission \`${getRolePerm(missing[0])}\``
                    : `les permissions ${missing.map((x) => `\`${getRolePerm(x)}\``).join(', ')}`
            } pour exécuter cette commande`
        );
export const clientMissingPerm = (user: User, missing: PermissionsString[]) =>
    denied(user)
        .setTitle('Permission manquante')
        .setDescription(
            `Je n'ai pas ${
                missing.length === 1
                    ? `la permission \`${getRolePerm(missing[0])}\``
                    : `les permissions ${missing.map((x) => `\`${getRolePerm(x)}\``).join(', ')}`
            } pour exécuter cette commande`
        );
export const cooldown = (user: User, cooldown: number) =>
    denied(user)
        .setTitle('Cooldown')
        .setDescription(`Vous avez un cooldown de ${cooldown.toFixed(1)} secondes sur cette commande`);
export const guildOnly = (user: User) =>
    denied(user)
        .setTitle('Serveur uniquement')
        .setDescription(`Cette commande n'est utilisable que sur un serveur`);
export const DMOnly = (user: User) =>
    denied(user)
        .setTitle('Message privés uniquement')
        .setDescription(`Cette commande n'est utilisable qu'en messages privés`);
export const emptyWhitelist = (user: User) =>
    base(user, { accentColor: true })
        .setTitle('Whitelist vide')
        .setDescription(
            `Il n'y a personne dans la whitelist.\nPour ajouter quelqu'un, utilisez la commande \`/whitelist ajouter\``
        );
export const unallowedInteraction = (user: User) =>
    base(user, { denied: true, footerText: 'client' })
        .setTitle('Interaction refusée')
        .setDescription(`Vous ne pouvez pas interagir avec ce message`);
export const paginationInvalidPage = (user: User, max: number) =>
    denied(user)
        .setTitle('Page invalide')
        .setDescription(`Veuillez spécifier un **nombre** valide compris entre **1** et **${max.toLocaleString()}**`);
export const cancel = () => new EmbedBuilder().setTitle('💡 Annulé').setColor('Yellow');
export const unAllowedAction = (user: User, guild: Guild) =>
    denied(user)
        .setTitle('Action interdite')
        .setDescription(`Vous n'êtes pas autorisé à faire ça sur ${guild.name}`);
export const raidmode = (user: User, guild: Guild) =>
    base(user, { accentColor: true })
        .setTitle('Raidmode')
        .setDescription(
            `Désolé, vous ne pouvez pas rentrer dans ${guild.name}, car il est actuellement en mode raid.\nEssayez de le rejoindre plus tard`
        );
export const gbanned = (user: User, guild: Guild) =>
    denied(user)
        .setTitle('GBanni')
        .setDescription(
            `Vous êtes GBanni des productions Draver. Pour cette raison, vous avez été banni de ${guild.name}.\nSi vous voulez revendiquer quoi que ce soit, contactez nous à l'adresse \`draver.industries@proton.me\``
        );
export const invalidNumber = (user: User, max: number, min: number) =>
    denied(user)
        .setTitle('Nombre invalide')
        .setDescription(
            `Vous avez saisi un nombre invalide.\nVeuillez choisir un nombre ${
                max === null
                    ? `supérieur à ${min.toLocaleString('fr')}`
                    : `entre ${min.toLocaleString('fr')} et ${max.toLocaleString('fr')}`
            }`
        );
export const timeQuestion = (user: User) => base(user, { question: true }).setTitle("Durée").setDescription(`Quelle est la durée ?\nRépondez dans le chat par un nombre suivit d'une de ces unites : \`s\` pour secondes, \`m\` pour minutes, \`h\` pour heures et \`d\` pour jours\nRépondez par \`cancel\` pour annuler`)
export const invalidTime = (user: User) => denied(user).setTitle("Durée invalide").setDescription(`Merci de préciser une durée valide.\nUtilisez un nombre suvit d'une de ces unités :\n${[['s', 'secondes'], ['m', 'minutes'], ['h', 'heures'], ['d', 'jours']].map(x => `- \`${x[0]}\` pour les ${x[1]}`).join('\n')}\nExemple : \`2d\` pour deux jours`)
export const memberNotModeratable = (user: User) => denied(user).setTitle("Membre non-modérable").setDescription(`Je ne peux pas effectuer d'actions de modération sur ce membre`)
export const memberBot = (user: User, member: GuildMember) => denied(user).setTitle("Bot").setDescription(`${pingUser(member)} est un bot.\nJe ne peux pas effectuer cette action sur un robot`)
export const selfMod = (user: User) => denied(user).setTitle("Auto-modération").setDescription(`Vous ne pouvez pas effectuer cette action sur vous-même`)
export const memberTooHigh = (user: User, member: GuildMember) => denied(user).setTitle("Membre trop haut").setDescription(`${pingUser(member)} est supérieur ou égal à vous dans la hiérarchie des rôles`)
export const memberTooHighClient = (user: User, member: GuildMember) => denied(user).setTitle("Membre trop haut").setDescription(`${pingUser(member)} est supérieur ou égal à moi dans la hiérarchie des rôles`)
export const memberOwner = (user: User, member: GuildMember) => denied(user).setTitle("Propriétaire").setDescription(`${pingUser(member)} est le propriétaire du serveur, je ne peux pas faire ça sur le propriétaire.`)
export const wait = (user: User) => base(user).setColor('#84923B').setTitle("Patientez").setDescription(`<a:chargement:839497157195071498> Veuillez patienter quelques instants...`)