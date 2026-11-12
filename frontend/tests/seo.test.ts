import { describe, expect, it } from 'vitest';
import {
  CANONICAL_SITE_URL,
  OFFICIAL_EMAIL,
  PHYSICAL_ADDRESS,
  PRIMARY_PHONE,
  WHATSAPP_LINK,
} from '@/lib/constants';
import {
  SITE_URL,
  websiteJsonLd,
  absoluteUrl,
  buildPageMetadata,
  localBusinessJsonLd,
  productJsonLd,
} from '@/lib/server/seo';
import type { Product } from '@/lib/types';

describe('canonical origin', () => {
  it('resolves to the production domain unless overridden', () => {
    expect(SITE_URL).toBe((process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_SITE_URL).replace(/\/$/, ''));
    expect(SITE_URL).toMatch(/^https:\/\//);
  });

  it('builds absolute URLs for absolute paths', () => {
    expect(absoluteUrl('/about')).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl('about')).toBe(`${SITE_URL}/about`);
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
  });
});

describe('buildPageMetadata', () => {
  const metadata = buildPageMetadata({
    title: 'Solar Equipment',
    description: 'Panels, inverters and batteries.',
    path: '/catalog',
  });

  it('sets the canonical URL', () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/catalog`);
  });

  it('mirrors the canonical URL into Open Graph and Twitter', () => {
    expect(metadata.openGraph?.url).toBe(`${SITE_URL}/catalog`);
    expect(metadata.openGraph?.siteName).toBeTruthy();
    expect(metadata.twitter).toMatchObject({ card: 'summary' });
  });

  it('keeps the title and description', () => {
    expect(metadata.title).toBe('Solar Equipment');
    expect(metadata.description).toBe('Panels, inverters and batteries.');
  });
});

describe('localBusinessJsonLd', () => {
  const jsonLd = localBusinessJsonLd();

  it('identifies the business with the published contact details', () => {
    expect(jsonLd.telephone).toBe(PRIMARY_PHONE);
    expect(jsonLd.email).toBe(OFFICIAL_EMAIL);
    expect(jsonLd.url).toBe(SITE_URL);
  });

  it('exposes a single contact point', () => {
    const contactPoints = jsonLd.contactPoint as Array<Record<string, unknown>>;
    expect(contactPoints).toHaveLength(1);
    expect(contactPoints[0].telephone).toBe(PRIMARY_PHONE);
  });

  it('describes the published address', () => {
    const address = jsonLd.address as Record<string, unknown>;
    expect(address.streetAddress).toBe(PHYSICAL_ADDRESS);
    expect(address.addressCountry).toBe('ET');
  });

  it('links the WhatsApp profile', () => {
    expect(jsonLd.sameAs).toContain(WHATSAPP_LINK);
  });

  it('does not publish an aggregate rating it has not earned', () => {
    expect(jsonLd.aggregateRating).toBeUndefined();
  });
});

describe('productJsonLd', () => {
  const product = {
    id: 'p1',
    name: 'Jinko 550W Panel',
    slug: 'jinko-550w',
    description: 'Tier-1 monocrystalline module.',
    sku: 'JKM-550',
    price: 4200,
    currency: 'ETB',
    stock_status: 'in_stock',
    images: [{ url: 'https://example.com/panel.webp', is_primary: true }],
    details: { brand: 'Jinko' },
  } as unknown as Product;

  const jsonLd = productJsonLd(product);

  it('builds the offer from the catalogue record', () => {
    expect(jsonLd.name).toBe('Jinko 550W Panel');
    expect(jsonLd.sku).toBe('JKM-550');
    expect(jsonLd.url).toBe(`${SITE_URL}/catalog/jinko-550w`);

    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers.price).toBe(4200);
    expect(offers.priceCurrency).toBe('ETB');
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('marks sold-out products as out of stock', () => {
    const soldOut = productJsonLd({ ...product, stock_status: 'sold_out' } as Product);
    const offers = soldOut.offers as Record<string, unknown>;
    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('omits a zero price instead of advertising a free product', () => {
    const free = productJsonLd({ ...product, price: 0 } as Product);
    const offers = free.offers as Record<string, unknown>;
    expect(offers).toBeUndefined();
  });
});


describe('homepage brand identity', () => {
  it('keeps an absolute homepage title consistent across search and sharing', () => {
    const title = 'Sara Solar | Solar Equipment in Ethiopia';
    const metadata = buildPageMetadata({ title, description: 'Solar equipment.', path: '/', absoluteTitle: true });
    expect(metadata.title).toEqual({ absolute: title });
    expect(metadata.openGraph?.title).toBe(title);
    expect(metadata.twitter?.title).toBe(title);
  });

  it('connects the website name to the existing business entity', () => {
    const website = websiteJsonLd();
    expect(website.name).toBe('Sara Solar');
    expect(website.url).toBe(`${SITE_URL}/`);
    expect(website.publisher).toEqual({ '@id': localBusinessJsonLd()['@id'] });
    expect(localBusinessJsonLd().alternateName).toBe(website.name);
  });
});

it('uses the actual product image for sharing without inventing dimensions', () => {
  const metadata = buildPageMetadata({ title: 'Panel', description: 'Solar panel', path: '/catalog/panel', image: 'https://example.com/panel.jpg' });
  expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/panel.jpg', alt: 'Panel' }]);
});
