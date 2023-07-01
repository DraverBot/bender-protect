import { log4js } from 'amethystjs';
import SendErrorLogToOwner from '../processes/SendErrorLogToOwner';
import SendUnallow from '../processes/SendUnallow';
import { DraverAPIListener } from '../structures/APIListener';
import { pingRole, pingUser } from '../utils/toolbox';
import ApplySanction from '../processes/ApplySanction';

export default new DraverAPIListener('RoleAdded')
    .addKey('RoleRemoved')
    .setRun(async ({ client, guild, user, data, type, ...rest }) => {
        if (!user || !client.whitelist.isWhitelisted(guild, user.id)) {
            SendUnallow.process(user, guild);

            const method = type === 'RoleAdded' ? 'remove' : 'add';
            const member = guild.members.cache.get(data.member);

            ApplySanction.process({ guild, user, sanction: 'memberEdit' });
            if (!member)
                return SendErrorLogToOwner.process({
                    guild,
                    logMessage: `Je n'ai pas pu ${method === 'add' ? 'rendre' : 'reprendre'} à ${pingUser(
                        data.member
                    )} (\`${data.member}\`) le rôle ${pingRole(data.role)} (\`${data.role}\`) qui lui a été ${
                        method === 'remove' ? 'ajouté' : 'retiré'
                    } par ${pingUser(rest.userId)} (\`${rest.userId}\`)`
                });

            member.roles[method](data.role).catch(log4js.trace);
        }
    });
