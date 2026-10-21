'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { ProductGrid } from './ProductGrid';
import { QuickViewModal } from './QuickViewModal';

interface ProductGridSectionProps {
  products: Product[];
}

/**
 * Client island around the product grid: owns the quick-view modal state so
 * the grid itself can be rendered from a server component.
 */
export const ProductGridSection: React.FC<ProductGridSectionProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <ProductGrid products={products} onQuickView={setSelectedProduct} />
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
};
