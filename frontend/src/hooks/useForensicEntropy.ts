import { useMemo } from 'react';
export const useForensicEntropy = (entropy: number) => {
  const isSuspicious = useMemo(() => entropy >= 7.85, [entropy]);
  return { isSuspicious };
};
