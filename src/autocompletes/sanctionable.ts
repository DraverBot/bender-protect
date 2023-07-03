import { AutocompleteListener } from 'amethystjs';
import { sanctionsData } from '../data/sanctionsData';
type key = keyof typeof sanctionsData;

export default new AutocompleteListener({
    listenerName: 'sanctionable',
    commandName: [{ commandName: 'sanctions', optionName: 'évènement' }],
    run: ({ focusedValue }) => {
        return Object.keys(sanctionsData)
            .filter(
                (x: key) =>
                    sanctionsData[x].name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                    focusedValue.toLowerCase().includes(sanctionsData[x].name.toLowerCase())
            )
            .map((k: key) => ({ name: sanctionsData[k].name, value: k }))
            .splice(0, 25);
    }
});
