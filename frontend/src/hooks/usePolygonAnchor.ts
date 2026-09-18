import { useState } from 'react';
export const usePolygonAnchor = () => {
  const [isAnchoring, setIsAnchoring] = useState(false);
  return { isAnchoring, setIsAnchoring };
};
