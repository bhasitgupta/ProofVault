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
      return { bg: 'bg-rose-50 border-rose-300', text: 'text-rose-700' };
    case 'CONFIDENTIAL':
      return { bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800' };
    case 'RESTRICTED':
    default:
      return { bg: 'bg-stone-100 border-stone-300', text: 'text-stone-700' };
  }
}

// Formatting utilities for judicial timestamps, hashes, and classification badges
