import { AmethystEvent } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import { GuildMember } from 'discord.js';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('guildMemberUpdate', async (bef, aft) => {
    const guild = aft.guild;

    const change = () => {
        return bef.roles.cache.size !== aft.roles.cache.size;
    };
    if (!change()) return;
    const valid = await CheckUserAction.process({ guild, event: 'MemberRoleUpdate', targetId: aft.id });

    const restore = async () => {
        const missing = bef.roles.cache.filter((r) => !aft.roles.cache.has(r.id));
        const over = aft.roles.cache.filter((r) => !bef.roles.cache.has(r.id));

        await Promise.all([
            aft.roles.remove(over, 'Auto-mod by Bender Protect').catch(() => {}),
            bef.roles.add(missing, 'Auto-mod by Bender Protect').catch(() => {})
        ]);
    };

    if (!valid) return restore;
    if (!valid.validated) {
        restore();
        await SendUnallow.process(valid.user, guild);

        ApplySanction.process({ guild, user: valid.user, sanction: 'memberEdit' });
    }
});
