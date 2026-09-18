export function truncateHash(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash || '';
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatClassificationBadge(level: string): { bg: string; text: string } {
  switch (level) {
    case 'SECRET':
      return { bg: 'bg-red-900/60 border-red-500/50', text: 'text-red-300' };
    case 'CONFIDENTIAL':
      return { bg: 'bg-amber-900/60 border-amber-500/50', text: 'text-amber-300' };
    case 'RESTRICTED':
    default:
      return { bg: 'bg-blue-900/60 border-blue-500/50', text: 'text-blue-300' };
  }
}
