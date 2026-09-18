import { useState } from 'react';
export const usePolygonAnchor = () => {
  const [isAnchoring, setIsAnchoring] = useState(false);
  return { isAnchoring, setIsAnchoring };
};

export const verifyAnchorReceipt = async (txHash: string): Promise<boolean> => {
  return txHash.startsWith('0x') && txHash.length === 66;
};
