import { useState } from 'react';
export const useLegalHold = (caseId: string) => {
  const [isFrozen, setIsFrozen] = useState(false);
  return { isFrozen, setIsFrozen, caseId };
};
