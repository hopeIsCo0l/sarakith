import type { Metadata } from 'next';
import {
  COMPANY_NAME,
  SITE_NAME,
  BRAND_TAGLINE,
  PHYSICAL_ADDRESS,
  PRIMARY_PHONE,
  OFFICIAL_EMAIL,
  GOOGLE_MAPS_LINK,
  WHATSAPP_LINK,
  CANONICAL_SITE_URL,
} from '@/lib/constants';
import { Product } from '@/lib/types';

/**
 * SEO helpers for server components.
 *
 * The canonical origin comes from NEXT_PUBLIC_SITE_URL when it is set, and
 * falls back to the production domain otherwise, so canonical tags, Open
 * Graph URLs, the sitemap and robots.txt are always correct.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_SITE_URL).replace(/\/$/, '');

export function absoluteUrl(path: string): string | undefined {
  if (!SITE_URL) return undefined;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
  absoluteTitle?: boolean;
  image?: string;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
  absoluteTitle = false,
  image,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const images = image ? (/^https?:\/\//.test(image) ? image : absoluteUrl(image)) : absoluteUrl('/icon.png');

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      locale: 'en_ET',
      images: images ? [{ url: images, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: images ? [images] : undefined,
    },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: absoluteUrl('/'),
    name: SITE_NAME,
    alternateName: [COMPANY_NAME, 'Sara Solars'],
    publisher: { '@id': absoluteUrl('/#business') },
    inLanguage: 'en',
  };
}

export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#business') || '#business',
    name: COMPANY_NAME,
    alternateName: SITE_NAME,
    description: BRAND_TAGLINE,
    url: SITE_URL || undefined,
    telephone: PRIMARY_PHONE,
    email: OFFICIAL_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: PHYSICAL_ADDRESS,
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    hasMap: GOOGLE_MAPS_LINK,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: PRIMARY_PHONE,
        contactType: 'sales',
        areaServed: 'ET',
        availableLanguage: ['en', 'am'],
      },
    ],
    sameAs: [WHATSAPP_LINK],
    aggregateRating: undefined,
  };
}

export function productJsonLd(product: Product): Record<string, unknown> {
  const image = (product.images?.find((image) => image.is_primary) || product.images?.[0])?.url;
  const price = Number(product.price);
  const url = absoluteUrl(`/catalog/${product.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku || undefined,
    image: image ? (image.startsWith('http') ? image : absoluteUrl(image)) : undefined,
    url,
    brand: {
      '@type': 'Brand',
      name: product.details?.brand || COMPANY_NAME,
    },
    category: product.category?.name || 'Solar equipment',
    offers: Number.isFinite(price) && price > 0 ? {
      '@type': 'Offer',
      availability:
        product.stock_status === 'sold_out'
          ? 'https://schema.org/OutOfStock'
          : product.stock_status === 'preorder'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/InStock',
      priceCurrency: product.currency || 'ETB',
      price,
      url,
      seller: { '@id': absoluteUrl('/#business') },
    } : undefined,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(
  entries: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

/**
 * Escape HTML delimiters so catalogue text cannot close the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
