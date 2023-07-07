import { AutocompleteListener } from 'amethystjs';
import { capitalize } from '../utils/toolbox';

export default new AutocompleteListener({
    listenerName: 'commande',
    commandName: [{ commandName: 'help' }],
    run: ({ focusedValue, client }) => {
        const includes = (x: string, y: string) =>
            x.toLowerCase().includes(y.toLowerCase()) || y.toLowerCase().includes(x.toLowerCase());
        return client.chatInputCommands
            .filter((x) => includes(x.options.name, focusedValue) || includes(x.options.description, focusedValue))
            .splice(0, 25)
            .map((x) => ({ name: capitalize(x.options.name), value: x.options.name }));
    }
});
