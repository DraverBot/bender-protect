import { AutocompleteListener } from 'amethystjs';
import { sanctionTypeData } from '../data/sanctionsData';
type key = keyof typeof sanctionTypeData;

export default new AutocompleteListener({
    listenerName: 'sanction',
    commandName: [{ commandName: 'sanctions', optionName: 'sanction' }],
    run: ({ focusedValue }) => {
        return Object.keys(sanctionTypeData)
            .filter(
                (x: key) =>
                    sanctionTypeData[x].name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                    focusedValue.toLowerCase().includes(sanctionTypeData[x].name.toLowerCase())
            )
            .map((x: key) => ({ name: sanctionTypeData[x].name, value: x }));
    }
});
