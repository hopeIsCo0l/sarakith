/**
 * Cache tags shared by the server data layer and the admin panel.
 * They are plain strings so both server and client bundles can use them.
 */
export const CACHE_TAGS = {
  products: 'catalog:products',
  categories: 'catalog:categories',
  services: 'catalog:services',
  settings: 'site:settings',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
