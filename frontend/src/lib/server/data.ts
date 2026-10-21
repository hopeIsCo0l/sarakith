import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SERVICES } from '@/lib/mockData';
import { DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { CACHE_TAGS } from '@/lib/cacheTags';
import { Category, Product, Service } from '@/lib/types';

/**
 * Server-side data access.
 *
 * Every PostgREST request is cached by Next.js with a tag, so catalog pages
 * are statically rendered and refreshed in the background. Admins can force
 * a refresh through POST /api/revalidate.
 */

export { CACHE_TAGS };

const REVALIDATE_SECONDS = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function tagsForRequest(input: RequestInfo | URL): string[] {
  const href =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : (input as Request).url;

  if (
    href.includes('/rest/v1/products') ||
    href.includes('/rest/v1/product_images') ||
    href.includes('/rest/v1/solar_attributes')
  ) {
    return [CACHE_TAGS.products];
  }
  if (href.includes('/rest/v1/categories')) return [CACHE_TAGS.categories];
  if (href.includes('/rest/v1/services')) return [CACHE_TAGS.services];
  if (href.includes('/rest/v1/site_settings')) return [CACHE_TAGS.settings];
  return [];
}

const serverFetch: typeof fetch = (input, init) => {
  const nextInit = (init ?? {}) as RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  };
  const tags = nextInit.next?.tags ?? tagsForRequest(input);

  return fetch(input, {
    ...nextInit,
    next: {
      revalidate: REVALIDATE_SECONDS,
      ...nextInit.next,
      tags,
    },
  } as RequestInit);
};

export const serverSupabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: serverFetch },
      })
    : null;

const PRODUCT_SELECT = `
  *,
  category:categories!category_id(*),
  sub_category:categories!sub_category_id(*),
  images:product_images(*)
`;

export const getServerCategories = cache(async (): Promise<Category[]> => {
  if (!serverSupabase) return MOCK_CATEGORIES;

  try {
    const { data, error } = await serverSupabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_CATEGORIES;
    return data as Category[];
  } catch (err) {
    console.warn('Server: failed to load categories', err);
    return MOCK_CATEGORIES;
  }
});

export const getServerProducts = cache(
  async (options?: { categorySlug?: string; isFeatured?: boolean }): Promise<Product[]> => {
    if (!serverSupabase) {
      let result = MOCK_PRODUCTS;
      if (options?.categorySlug && options.categorySlug !== 'all') {
        result = result.filter((p) => p.category?.slug === options.categorySlug);
      }
      if (options?.isFeatured) {
        result = result.filter((p) => p.is_featured);
      }
      return result;
    }

    try {
      let query = serverSupabase
        .from('products')
        .select(PRODUCT_SELECT)
        .order('created_at', { ascending: false });

      if (options?.isFeatured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) return MOCK_PRODUCTS;

      let products = data as Product[];
      if (options?.categorySlug && options.categorySlug !== 'all') {
        products = products.filter((p) => p.category?.slug === options.categorySlug);
      }
      return products;
    } catch (err) {
      console.warn('Server: failed to load products', err);
      return MOCK_PRODUCTS;
    }
  }
);

export const getServerProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    if (!serverSupabase) {
      return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
    }

    try {
      const { data, error } = await serverSupabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) return null;
      return data as Product;
    } catch (err) {
      console.warn(`Server: failed to load product "${slug}"`, err);
      return null;
    }
  }
);

export const getServerServices = cache(async (): Promise<Service[]> => {
  if (!serverSupabase) return MOCK_SERVICES;

  try {
    const { data, error } = await serverSupabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_SERVICES;
    return data as Service[];
  } catch (err) {
    console.warn('Server: failed to load services', err);
    return MOCK_SERVICES;
  }
});

export const getServerSiteSettings = cache(async (): Promise<
  Record<string, { key: string; name: string; url: string; category: string; alt_text?: string }>
> => {
  if (!serverSupabase) return DEFAULT_SITE_SETTINGS;

  try {
    const { data, error } = await serverSupabase.from('site_settings').select('*');
    if (error || !data || data.length === 0) return DEFAULT_SITE_SETTINGS;

    const settingsMap: Record<string, any> = { ...DEFAULT_SITE_SETTINGS };
    data.forEach((item: any) => {
      settingsMap[item.key] = item;
    });
    return settingsMap;
  } catch (err) {
    console.warn('Server: failed to load site settings', err);
    return DEFAULT_SITE_SETTINGS;
  }
});

/**
 * Read a single setting value with the same fallback chain used by the
 * client-side SiteSettingsContext.
 */
export function readSetting(
  settings: Record<string, { url?: string }>,
  key: string,
  fallback = ''
): string {
  const current = settings[key];
  if (current && current.url) return current.url;
  const defaults = DEFAULT_SITE_SETTINGS as Record<string, { url?: string }>;
  const preset = defaults[key];
  if (preset && preset.url) return preset.url;
  return fallback;
}
