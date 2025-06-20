export const parseExpiry = (expiryString) => {
  if (!expiryString || typeof expiryString !== 'string') return undefined;

  const match = expiryString.match(/^(\d+)([mhd])$/i);
  if (!match) return undefined;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return undefined;
  }
};
