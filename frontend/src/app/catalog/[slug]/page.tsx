import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerProductBySlug, getServerProducts } from '@/lib/server/data';
import { ProductDetailView } from '@/components/catalog/ProductDetailView';
import {
  buildPageMetadata,
  JsonLd,
  breadcrumbJsonLd,
  productJsonLd,
} from '@/lib/server/seo';

export const revalidate = 300;
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getServerProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product not found',
      description: 'The requested solar product could not be found in the catalog.',
    };
  }

  return buildPageMetadata({
    title: product.name,
    description:
      product.description?.slice(0, 180) ||
      `${product.name} — technical specifications and availability from Sara Power Solution plc.`,
    path: `/catalog/${product.slug}`,
    type: 'article',
    keywords: [product.name, product.sku || '', product.category?.name || ''].filter(
      Boolean
    ),
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getServerProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getServerProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category?.slug === product.category?.slug)
    .slice(0, 4);

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Catalog', path: '/catalog' },
          { name: product.name, path: `/catalog/${product.slug}` },
        ])}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
