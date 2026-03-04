import type { CountdownEvent } from '../types';

/**
 * Encodes the event state into a compact Base64 JSON string for the URL hash.
 */
export const encodeEventState = (event: CountdownEvent): string => {
  // Use short keys to minimize URL length
  const compactState = {
    n: event.name,
    d: event.targetDate,
    t: event.timezone,
  };
  
  const json = JSON.stringify(compactState);
  // URL-safe base64 encoding
  return btoa(encodeURIComponent(json));
};

/**
 * Decodes the event state from the Base64 URL hash.
 */
export const decodeEventState = (hash: string): CountdownEvent | null => {
  try {
    // Remove the '#/' if present
    const cleanHash = hash.replace(/^#\/?/, '');
    if (!cleanHash) return null;
    
    // Check if it has a prefix e.g., 'c='
    const payload = cleanHash.startsWith('c=') ? cleanHash.slice(2) : cleanHash;
    
    const json = decodeURIComponent(atob(payload));
    const compactState = JSON.parse(json);
    
    if (compactState.n === undefined || !compactState.d || !compactState.t) {
      return null; // Invalid state
    }
    
    return {
      name: compactState.n,
      targetDate: compactState.d,
      timezone: compactState.t,
    };
  } catch (e) {
    console.error('Failed to decode URL state', e);
    return null;
  }
};
