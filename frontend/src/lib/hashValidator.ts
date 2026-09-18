export const isSha256 = (str: string): boolean => /^[a-fA-F0-9]{64}$/.test(str);

export const formatTruncatedHash = (h: string): string => h.length > 16 ? `${h.slice(0, 8)}...${h.slice(-8)}` : h;
