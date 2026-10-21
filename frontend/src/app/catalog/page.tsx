import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerCategories, getServerProducts } from '@/lib/server/data';
import { CatalogView } from '@/components/catalog/CatalogView';
import { buildPageMetadata, JsonLd, breadcrumbJsonLd } from '@/lib/server/seo';

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'Solar Equipment Catalog',
  description:
    'Browse Tier-1 monocrystalline solar panels, hybrid pure sine wave inverters, LiFePO4 lithium batteries and MPPT controllers available for delivery in Addis Ababa.',
  path: '/catalog',
  keywords: [
    'solar panels Ethiopia',
    'hybrid inverter Addis Ababa',
    'LiFePO4 battery supplier',
    'MPPT solar controller',
    'solar equipment catalog',
  ],
});

function CatalogFallback() {
  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-20 text-center">
      <p className="text-xs font-mono text-kith-muted uppercase tracking-widest animate-pulse">
        LOADING CATALOG…
      </p>
    </div>
  );
}

export default async function CatalogPage() {
  const [categories, products] = await Promise.all([
    getServerCategories(),
    getServerProducts(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Catalog', path: '/catalog' },
        ])}
      />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogView categories={categories} products={products} />
      </Suspense>
    </>
  );
}
