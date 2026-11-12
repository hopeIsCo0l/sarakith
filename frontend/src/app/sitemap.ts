import type { MetadataRoute } from 'next';
import { getServerProducts } from '@/lib/server/data';
import { absoluteUrl } from '@/lib/server/seo';

export const revalidate = 3600;

// Only canonical pages belong here. Filter URLs canonicalize to /catalog.
// Omit lastModified unless there is a real content update timestamp.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getServerProducts();
  const staticRoutes = ['/', '/catalog', '/calculator', '/services', '/about', '/terms', '/privacy-policy'];
  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path)! })),
    ...products.map((product) => {
      const updated = product.updated_at ? new Date(product.updated_at) : undefined;
      return {
        url: absoluteUrl(`/catalog/${product.slug}`)!,
        ...(updated && Number.isFinite(updated.getTime()) ? { lastModified: updated } : {}),
      };
    }),
  ];
}
