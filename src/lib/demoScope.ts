/**
 * Demo Scope Isolation Utility
 * 
 * Provides client-side, per-device data isolation for demo purposes.
 * Uses a persistent random identifier stored in localStorage to separate
 * data created on different devices/browsers.
 */

const DEMO_SCOPE_KEY = "demo_scope_id";
const SCOPE_PREFIX = "[[";
const SCOPE_SUFFIX = "]]";

/**
 * Generates a random 5-character alphanumeric string
 */
const generateScopeId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Gets the current demo scope ID, creating one if it doesn't exist
 */
export const getDemoScopeId = (): string => {
  let scopeId = localStorage.getItem(DEMO_SCOPE_KEY);
  if (!scopeId) {
    scopeId = generateScopeId();
    localStorage.setItem(DEMO_SCOPE_KEY, scopeId);
  }
  return scopeId;
};

/**
 * Embeds the demo scope ID into a string (e.g., class name)
 * Format: "[[scopeId]]originalName"
 */
export const embedScopeId = (name: string): string => {
  const scopeId = getDemoScopeId();
  return `${SCOPE_PREFIX}${scopeId}${SCOPE_SUFFIX}${name}`;
};

/**
 * Extracts the scope ID from an embedded string
 * Returns null if no scope ID is found
 */
export const extractScopeId = (name: string): string | null => {
  if (!name.startsWith(SCOPE_PREFIX)) return null;
  const endIndex = name.indexOf(SCOPE_SUFFIX);
  if (endIndex === -1) return null;
  return name.substring(SCOPE_PREFIX.length, endIndex);
};

/**
 * Strips the scope ID from an embedded string to get the display name
 */
export const stripScopeId = (name: string): string => {
  if (!name.startsWith(SCOPE_PREFIX)) return name;
  const endIndex = name.indexOf(SCOPE_SUFFIX);
  if (endIndex === -1) return name;
  return name.substring(endIndex + SCOPE_SUFFIX.length);
};

/**
 * Checks if a name belongs to the current device's scope
 */
export const belongsToCurrentScope = (name: string): boolean => {
  const scopeId = extractScopeId(name);
  if (!scopeId) return false;
  return scopeId === getDemoScopeId();
};

/**
 * Filters an array of items to only include those belonging to the current scope
 * Uses a name extractor function to get the name field from each item
 */
export const filterByScope = <T>(
  items: T[],
  nameExtractor: (item: T) => string
): T[] => {
  return items.filter((item) => belongsToCurrentScope(nameExtractor(item)));
};
