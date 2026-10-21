import type { Metadata } from 'next';
import {
  COMPANY_NAME,
  BRAND_TAGLINE,
  PHYSICAL_ADDRESS,
  PRIMARY_PHONE,
  SECONDARY_PHONE,
  OFFICIAL_EMAIL,
  GOOGLE_MAPS_LINK,
  WHATSAPP_LINK,
} from '@/lib/constants';
import { Product } from '@/lib/types';

/**
 * SEO helpers for server components.
 *
 * The canonical origin comes from NEXT_PUBLIC_SITE_URL. When it is missing we
 * deliberately omit absolute URLs instead of guessing a domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

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
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  type = 'website',
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const images = absoluteUrl('/icon.png');

  return {
    title,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: `${title} | ${COMPANY_NAME}`,
      description,
      url: canonical,
      siteName: COMPANY_NAME,
      type,
      locale: 'en_ET',
      images: images ? [{ url: images, width: 512, height: 512, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${title} | ${COMPANY_NAME}`,
      description,
      images: images ? [images] : undefined,
    },
  };
}

export function localBusinessJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#business') || '#business',
    name: COMPANY_NAME,
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
      {
        '@type': 'ContactPoint',
        telephone: SECONDARY_PHONE,
        contactType: 'technical support',
        areaServed: 'ET',
        availableLanguage: ['en', 'am'],
      },
    ],
    sameAs: [WHATSAPP_LINK],
    aggregateRating: undefined,
  };
}

export function productJsonLd(product: Product): Record<string, unknown> {
  const image = product.images?.[0]?.url;
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
    offers: {
      '@type': 'Offer',
      availability:
        product.stock_status === 'sold_out'
          ? 'https://schema.org/OutOfStock'
          : product.stock_status === 'preorder'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/InStock',
      priceCurrency: product.currency || 'ETB',
      price: Number(product.price) > 0 ? Number(product.price) : undefined,
      url,
      seller: { '@type': 'Organization', name: COMPANY_NAME },
    },
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
 * Renders a JSON-LD block. Next escapes the payload, so the script stays
 * inert for crawlers and safe from injection.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
