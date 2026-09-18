export const isSha256 = (str: string): boolean => /^[a-fA-F0-9]{64}$/.test(str);
