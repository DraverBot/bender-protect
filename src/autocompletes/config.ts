import { AutocompleteListener } from "amethystjs";
import { configsData } from "../data/configsData";

export default new AutocompleteListener({
    listenerName: 'configs',
    commandName: [{commandName: 'configurer'}],
    run: ({focusedValue}) => {
        const include = (x: string, y: string) => x.toLowerCase().includes(y.toLowerCase()) || y.toLowerCase().includes(x.toLowerCase());
        return Object.keys(configsData).filter((x: keyof typeof configsData) => include(configsData[x].name, focusedValue) || include(configsData[x].description, focusedValue)).map(x => ({ name: configsData[x].name, value: x })).splice(0, 25)
    }
})