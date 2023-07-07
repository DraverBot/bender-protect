import { AmethystEvent, log4js, wait } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';

export default new AmethystEvent('guildUpdate', async (bef, aft) => {
    await wait(1000, 'ms');
    const valid = await CheckUserAction.process({ guild: aft, event: 'GuildUpdate', targetId: undefined });

    const reedit = async () => {
        const iconUrl = bef.iconURL({ size: 4096 }) ?? null;
        const splashURL = bef.splashURL({ size: 4096 }) ?? null;
        const bannerUrl = bef.bannerURL({ size: 4096 }) ?? null;

        await aft
            .edit({
                ...(bef.toJSON() as object),
                icon: iconUrl,
                splash: splashURL,
                banner: bannerUrl,
                reason: 'Auto-mod by Bender Protect'
            })
            .catch(log4js.trace);
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, aft);

        ApplySanction.process({ guild: aft, user: valid.user, sanction: 'serverEdit' });
    }
});
