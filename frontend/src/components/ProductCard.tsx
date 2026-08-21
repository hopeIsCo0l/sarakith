'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Phone, ArrowRight, Terminal } from 'lucide-react';
import { Product } from '@/lib/types';
import { WHATSAPP_LINK } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images.find((img) => img.is_primary)?.url || product.images[0]?.url || 'https://images.unsplash.com/photo-1544441893-675973e31985';
  const secondaryImage = product.images.find((img) => !img.is_primary)?.url || primaryImage;

  const stockBadgeStyles = {
    in_stock: 'border-emerald-500/30 text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 shadow-sm',
    low_stock: 'border-amber-500/30 text-amber-500 dark:text-amber-400 bg-amber-500/10 shadow-sm',
    preorder: 'border-purple-500/30 text-purple-500 dark:text-purple-400 bg-purple-500/10 shadow-sm',
    sold_out: 'border-red-500/30 text-red-500 dark:text-red-400 bg-red-500/10 shadow-sm',
  };

  const stockLabels = {
    in_stock: 'SYS_READY',
    low_stock: 'LOW_RES',
    preorder: 'PRE_SYNC',
    sold_out: 'DEPLETED',
  };

  return (
    <div
      className="group relative flex flex-col tech-panel overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scanline overlay on hover */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(111,15,16,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 mix-blend-overlay"></div>

      {/* Image Display */}
      <div className="relative aspect-[4/3] w-full bg-white/80 overflow-hidden border-b border-sara-red/20 p-4">
        {/* Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-sara-red/50 z-10"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-sara-red/50 z-10"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-sara-red/50 z-10"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-sara-red/50 z-10"></div>

        <Image
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-8 filter transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
        />

        {/* Stock Status Overlay Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-2 py-1 text-[9px] font-mono font-bold tracking-widest uppercase border ${
              stockBadgeStyles[product.stock_status] || stockBadgeStyles.in_stock
            }`}
          >
            {stockLabels[product.stock_status]}
          </span>
        </div>

        {/* Hover Quick View Overlay Action */}
        <div className="absolute inset-0 bg-kith-bg/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 z-10">
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="flex-1 py-2 px-4 bg-sara-red/20 text-sara-red dark:text-red-300 border border-sara-red/60 hover:bg-sara-red hover:text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(111,15,16,0.3)]"
            >
              <Eye className="w-3.5 h-3.5" />
              QUERY_DATA
            </button>
          )}

          <a
            href={`${WHATSAPP_LINK}?text=${encodeURIComponent(`[SECURE_COMMS] Requesting specs for HW_UNIT: ${product.name} (SKU: ${product.sku || 'N/A'})`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-sara-red/20 text-sara-red dark:text-red-400 border border-sara-red/50 hover:bg-sara-red hover:text-white transition-colors shadow-[0_0_15px_rgba(111,15,16,0.3)]"
            title="Contact via COMMS"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-kith-subBg/40 relative z-10">
        <div>
          {/* Category & Details */}
          <div className="flex items-center justify-between text-[9px] font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase mb-3">
            <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3" /> {product.category?.name || 'CLASS_UNDEF'}</span>
            {product.details?.material && (
              <span className="truncate max-w-[120px] text-kith-muted">
                {product.details.material}
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/catalog/${product.slug}`}>
            <h3 className="text-sm font-black font-mono tracking-widest text-kith-bone line-clamp-2 group-hover:text-sara-red dark:group-hover:text-red-400 transition-colors uppercase">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-sara-red/20 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-sara-red dark:text-red-400 uppercase tracking-superwide flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            REQUEST_ESTIMATE
          </span>

          <Link
            href={`/catalog/${product.slug}`}
            className="w-7 h-7 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center text-sara-red dark:text-red-400 group-hover:bg-sara-red group-hover:text-white group-hover:shadow-[0_0_10px_rgba(111,15,16,0.4)] transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
