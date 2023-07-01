import { Client, Guild, User } from "discord.js";
import { BenderAPIOptions, BenderAPIType } from "../typings/draver";

export class DraverAPIListener<Key extends BenderAPIType> {
    public run: (data: { type: BenderAPIType, guildId: string; userId: string; data: BenderAPIOptions<Key>['data']; client: Client; guild: Guild; user: User}) => unknown;
    public keys: BenderAPIType[] = []
    
    constructor(public key: Key) {
        this.keys.push(key);
    }

    public setRun(method: (data: { type: BenderAPIType, guildId: string; userId: string; data: BenderAPIOptions<Key>['data']; client: Client; guild: Guild; user: User}) => unknown) {
        this.run = method;
        return this;
    }
    public addKey(key: BenderAPIType) {
        if (!this.keys.includes(key)) this.keys.push(key)
        return this;
    }
}