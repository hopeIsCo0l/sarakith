'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, ArrowLeft, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const prod = await getProductBySlug(params.slug);
      if (prod) {
        setProduct(prod);
        const related = await getProducts({ categorySlug: prod.category?.slug });
        setRelatedProducts(related.filter((p) => p.id !== prod.id).slice(0, 4));
      }
      setLoading(false);
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-[1700px] mx-auto px-4 py-20 text-center text-xs font-mono text-kith-muted">
        LOADING SPECIFICATIONS...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1700px] mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-mono text-kith-bone uppercase">PRODUCT NOT FOUND</h2>
        <Link href="/catalog" className="text-xs font-mono text-sky-500 underline">
          RETURN TO CATALOG
        </Link>
      </div>
    );
  }

  const activeImage = product.images[selectedImgIndex]?.url || product.images[0]?.url || '';

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-16">
      {/* Back Link */}
      <div>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-kith-muted hover:text-kith-bone transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO FULL CATALOG
        </Link>
      </div>

      {/* Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full max-w-[600px] mx-auto bg-kith-subBg border border-kith-border overflow-hidden group">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-contain object-center p-4"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-kith-card/80 border border-kith-border hover:bg-kith-card text-kith-bone transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImgIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-kith-card/80 border border-kith-border hover:bg-kith-card text-kith-bone transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-kith-card/90 text-kith-bone text-[10px] font-mono tracking-widest uppercase border border-kith-border shadow-sm">
              IMAGE {selectedImgIndex + 1} OF {product.images.length || 1}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative w-20 h-24 border transition-all overflow-hidden flex-shrink-0 ${
                    selectedImgIndex === idx
                      ? 'border-kith-bone scale-105'
                      : 'border-kith-border opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Spec Sheet & Purchase CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-8 bg-kith-card border border-kith-border p-6 sm:p-8 h-fit">
          {/* Main Info Header */}
          <div className="space-y-3 border-b border-kith-border pb-6">
            <div className="flex items-center justify-between text-xs font-mono text-kith-muted uppercase tracking-widest">
              <span>{product.category?.name || 'SPECIAL DROP'}</span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-kith-bone uppercase leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-500" />
                Inquire for Current Pricing
              </span>

              <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                {product.stock_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono tracking-superwide uppercase text-kith-muted">
              OVERVIEW
            </h3>
            <p className="text-xs font-mono text-kith-bone leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Equipment Technical Specs */}
          {product.details && Object.keys(product.details).length > 0 && (
            <div className="space-y-3 border-t border-kith-border pt-6">
              <h3 className="text-[10px] font-mono tracking-superwide uppercase text-sara-red dark:text-red-400 font-bold">
                EQUIPMENT TECHNICAL SPECIFICATIONS MATRIX
              </h3>
              <div className="divide-y divide-kith-border/60 text-xs font-mono">
                {Object.entries(product.details)
                  .filter(([key]) => key !== 'delivery_available')
                  .map(([key, val]) => (
                    <div key={key} className="py-2.5 flex items-center justify-between">
                      <span className="capitalize text-kith-darkMuted tracking-wider">
                        {key === 'power_output' ? 'Capacity / Output' : key.replace('_', ' ')}
                      </span>
                      <span className="text-kith-bone font-medium">{val}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* WhatsApp Direct Contact CTA */}
          <div className="space-y-4 border-t border-kith-border pt-6">
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello Sara Power Solution plc, I am inquiring about product specs and availability for ${product.name} (SKU: ${product.sku || 'N/A'})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all shadow-xl"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
              CONTACT VIA WHATSAPP ({PRIMARY_PHONE})
            </a>

            {/* Service & Delivery Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono text-kith-darkMuted pt-2">
              <div className="flex items-center gap-2 border border-kith-border/60 p-2.5 bg-kith-subBg/40">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="truncate uppercase">
                  {product.details?.warranty || 'GENUINE WARRANTY'}
                </span>
              </div>
              <div className="flex items-center gap-2 border border-kith-border/60 p-2.5 bg-kith-subBg/40">
                <Truck className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <span className="truncate uppercase">
                  {product.details?.delivery_available ||
                    (typeof product.delivery_available === 'string'
                      ? product.delivery_available
                      : 'ADDIS ABABA DELIVERY')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 border-t border-kith-border pt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono tracking-widest uppercase text-kith-bone font-bold">
              RELATED ARCHIVAL SELECTIONS
            </h3>
            <Link href="/catalog" className="text-xs font-mono text-kith-muted hover:text-kith-bone uppercase">
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
