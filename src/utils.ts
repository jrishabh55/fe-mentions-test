export const getLastMention = (value: string, symbol: string) => value.split(symbol).at(-1) ?? '';
