import { AmethystEvent, log4js } from 'amethystjs';
import CheckUserAction from '../processes/CheckUserAction';
import SendUnallow from '../processes/SendUnallow';
import ApplySanction from '../processes/ApplySanction';
import { Guild } from 'discord.js';

export default new AmethystEvent('guildUpdate', async (bef, aft) => {
    const valid = await CheckUserAction.process({ guild: aft, event: 'GuildUpdate', targetId: undefined });
    const reedit = async () => {
        const iconUrl = bef.iconURL({ size: 4096 }) ?? null;
        const splashURL = bef.splashURL({ size: 4096 }) ?? null;
        const bannerUrl = bef.bannerURL({ size: 4096 }) ?? null;

        const reason = "Auto-mod by Bender Protect"

        const compare = (key: keyof typeof bef) => bef[key] !== aft[key];
        const promises: Promise<Guild | void>[] = []
        const operate = (pr: Promise<Guild>) => promises.push(pr.catch(log4js.trace))
        
        if (compare('name')) operate(aft.setName(bef.name, reason))
        if (compare('afkChannel')) operate(aft.setAFKChannel(bef.afkChannel, reason))
        if (compare('afkTimeout')) operate(aft.setAFKTimeout(bef.afkTimeout, reason))
        if (compare('banner')) operate(aft.setBanner(bannerUrl, reason))
        if (compare('discoverySplash')) operate(aft.setDiscoverySplash(splashURL, reason))
        if (compare('systemChannel')) operate(aft.setSystemChannel(bef.systemChannel, reason))
        if (compare('explicitContentFilter')) operate(aft.setExplicitContentFilter(bef.explicitContentFilter, reason))
        if (compare('features')) operate(aft.edit({ features: bef.features, reason }))
        if (compare('description')) operate(aft.edit({ description: bef.description, reason }))
        if (compare('icon')) operate(aft.setIcon(iconUrl, reason))
        if (compare('verificationLevel')) operate(aft.setVerificationLevel(bef.verificationLevel, reason))
        if (compare('mfaLevel')) operate(aft.setMFALevel(bef.mfaLevel))

        await Promise.all(promises);
    };
    if (!valid) return reedit();

    if (!valid.validated) {
        reedit();
        await SendUnallow.process(valid.user, aft);

        // ApplySanction.process({ guild: aft, user: valid.user, sanction: 'serverEdit' });
    }
});
