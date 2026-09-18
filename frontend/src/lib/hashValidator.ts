export const isSha256 = (str: string): boolean => /^[a-fA-F0-9]{64}$/.test(str);

export const formatTruncatedHash = (h: string): string => h.length > 16 ? `${h.slice(0, 8)}...${h.slice(-8)}` : h;

export const formatTxExplorerUrl = (tx: string): string => `https://amoy.polygonscan.com/tx/${tx}`;

export const formatAddressUrl = (addr: string): string => `https://amoy.polygonscan.com/address/${addr}`;

export const formatBlockUrl = (b: number): string => `https://amoy.polygonscan.com/block/${b}`;
