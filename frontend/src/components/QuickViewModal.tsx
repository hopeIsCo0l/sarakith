'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Phone, ShieldCheck, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  const activeImage = product.images[selectedImgIndex]?.url || product.images[0]?.url || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-kith-card border border-kith-border shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-kith-card text-kith-bone border border-kith-border hover:bg-kith-btnPrimaryBg hover:text-kith-btnPrimaryText transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 bg-kith-subBg border-b md:border-b-0 md:border-r border-kith-border flex flex-col">
          <div className="relative aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center group">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-kith-card/80 border border-kith-border hover:bg-kith-card text-kith-bone transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImgIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-kith-card/80 border border-kith-border hover:bg-kith-card text-kith-bone transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-kith-card/90 text-kith-bone text-[10px] font-mono tracking-widest uppercase border border-kith-border">
              IMAGE {selectedImgIndex + 1} OF {product.images.length || 1}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="p-3 flex items-center gap-2 border-t border-kith-border bg-kith-card/60 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative w-16 h-20 border transition-all overflow-hidden flex-shrink-0 ${
                    selectedImgIndex === idx ? 'border-kith-bone scale-105' : 'border-kith-border opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Specs */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-kith-muted uppercase tracking-widest">
                <span>{product.category?.name || 'SPECIAL CAPSULE'}</span>
                {product.sku && <span>SKU: {product.sku}</span>}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-kith-bone uppercase">
                {product.name}
              </h2>
              <div className="pt-1 flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Inquire for Pricing
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  {product.stock_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs font-mono text-kith-muted leading-relaxed border-t border-kith-border pt-4">
              {product.description}
            </p>

            {/* Specifications Matrix */}
            {product.details && Object.keys(product.details).length > 0 && (
              <div className="space-y-2 border-t border-kith-border pt-4">
                <h4 className="text-[10px] font-mono tracking-superwide uppercase text-kith-bone font-bold flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-amber-500" />
                  EQUIPMENT TECHNICAL SPECIFICATIONS
                </h4>
                <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                  {Object.entries(product.details).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-kith-border/40 text-kith-muted">
                      <span className="capitalize text-kith-darkMuted">{key.replace('_', ' ')}:</span>
                      <span className="text-kith-bone font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 border-t border-kith-border pt-6">
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`Hello Sara Power Solution plc, I am interested in technical specs and availability for ${product.name} (SKU: ${product.sku || 'N/A'})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-kith-btnPrimaryBg text-kith-btnPrimaryText hover:bg-kith-btnPrimaryHover text-xs font-mono tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
              CONTACT VIA WHATSAPP ({PRIMARY_PHONE})
            </a>

            <div className="flex items-center justify-between text-[10px] font-mono text-kith-darkMuted">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> AUTHENTIC GUARANTEE
              </span>
              <Link href={`/catalog/${product.slug}`} onClick={onClose} className="underline hover:text-kith-bone">
                VIEW FULL DETAIL PAGE →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
