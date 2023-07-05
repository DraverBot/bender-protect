import { AmethystCommand, log4js } from "amethystjs";
import { classic } from "../utils/embeds";
import { capitalize, pingUser, util } from "../utils/toolbox";

export default new AmethystCommand({
    name: 'guide',
    description: "Affiche le guide du bot"
}).setChatInputRun(async({ interaction, client }) => {
    await interaction.deferReply().catch(log4js.trace)
    await client.application.commands.fetch().catch(log4js.trace);

    const commandName = (name: string) => {
        const app = client.application.commands.cache.find(x => x.name === name)
        if (!app) return `\`/${name}\``
        return `</${name}:${app.id}>`
    }

    interaction.editReply({
        embeds: [
            classic(interaction.user, { accentColor: true, footerText: 'client' })
                .setTitle("Guide")
                .setDescription(`Voici le guide d'utilisation de ${pingUser(client.user)}\n## Présentation\nBender Protect est un bot de protection pour votre serveur qui le protègera contre toute tentative d'attaque. Le bot se base sur un système de whitelist, une liste d'utilisateurs que seul le propriétaire du serveur peut modifier, qui autorise ces utilisateurs et seulement ces utilisateurs à modifier le serveur, les rôles, les salons et les membres.\nEn cas d'une modification non-autorisée, Bender Protect rétablira les changements fait par la personne, puis lui appliquera une sanction, configurable.\nSi un bot fait une action de modération, son action sera également annulée, sauf si il fait partie de la whitelist (ce qui n'est pas recommendé).\nSeul [Draver](${util('draver')}) permet de faire des actions de modération avec un bot, tout en conservant la protection. En effet, [Draver](${util('draver')}) est connecté à Bender Protect, ce qui fait que la moindre action effectuée avec Draver sera transmise à Bender Protect pour être vérifiée.\n\n### Sanctions\nLes sanctions applicables lorsque quelqu'un fait une action qu'il n'a pas le droit de faire sont les suivantes :\n- Bannissement\n- Bannissement temporaire\n- Expulsion\n- Destitution des rôles de modération\n\nPour configurer la sanction appliquée, vous devez utiliser la commande ${commandName('sanctions')}, utilisable seulement par le propriétaire du serveur.\n### Entre autres\nBender Protect est doté de commandes que vous pouvez utiliser pour gérer votre serveur, telle que ${commandName('tempban')}, ${commandName('mute')} et d'autres\n### Destitution\nLors d'une destitution, tout les rôles d'un membres qui contiennent une de ces permissions seront retirés :\n${['administrateur', 'gérer le serveur', 'gérer les membres', 'gérer les rôles', 'gérer les pseudo', 'expulser des membres', 'bannir des membres', 'muter des membres', 'voir les logs du serveur'].map(x => `- ${capitalize(x)}`).join('\n')}\n### GBan\nBender Protect possède également un système de bannissement global, partagé avec Draver, qui bannira quiconque appartient à cette liste lorsqu'il essaiera de rejoindre le serveur. Vous pouvez désactiver cette fonctionnalité en utilisant la commande ${commandName('configurer')}.\nUn système de mode raid est également présent, c'est un système qui permet d'empêcher tout les utilisateurs de rejoindre le serveur, que vous pouvez activer via la commande ${commandName('configurer')}\nUn système d'antispam est également intégré au bot, vous pouvez régler tout les paramètres de l'antispam en utilisant la commande ${commandName('configurer')}`)
                .setFields(
                    {
                        name: 'Contacts',
                        value: `Vous pouvez contacter les développeurs via :\n[Instagram](${util('instagram')})\n[Discord](${util('support')})\nMail : \`${util('email')}\``,
                        inline: false
                    }
                )
        ]
    })
})