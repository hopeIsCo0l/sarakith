import type { MetadataRoute } from 'next';
import { getServerCategories, getServerProducts } from '@/lib/server/data';
import { absoluteUrl, SITE_URL } from '@/lib/server/seo';

export const revalidate = 3600;

/**
 * Dynamic sitemap built from the live catalog. Requires NEXT_PUBLIC_SITE_URL
 * to be set, otherwise there is no canonical origin to build absolute URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE_URL) {
    console.warn(
      'sitemap: NEXT_PUBLIC_SITE_URL is not set, skipping sitemap generation.'
    );
    return [];
  }

  const [products, categories] = await Promise.all([
    getServerProducts(),
    getServerCategories(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/') || '/', lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/catalog') || '/catalog', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/calculator') || '/calculator', lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/services') || '/services', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/about') || '/about', lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => !category.parent_id)
    .map((category) => ({
      url: absoluteUrl(`/catalog?category=${category.slug}`) || '/catalog',
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/catalog/${product.slug}`) || `/catalog/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
