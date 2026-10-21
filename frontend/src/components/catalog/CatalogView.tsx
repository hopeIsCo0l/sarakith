'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Category, FilterState, Product } from '@/lib/types';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ProductGridSection } from '@/components/ProductGridSection';
import { Zap, Terminal } from 'lucide-react';

interface CatalogViewProps {
  categories: Category[];
  products: Product[];
}

const INITIAL_FILTERS: FilterState = {
  categorySlug: 'all',
  searchQuery: '',
  stockStatus: 'all',
  maxPrice: 250000,
  sortBy: 'featured',
};

/**
 * Client island for the catalog: owns the filter state, the category header
 * block and the quick-view modal. The data itself is fetched on the server.
 */
export const CatalogView: React.FC<CatalogViewProps> = ({ categories, products }) => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    categorySlug:
      categoryFromUrl && categories.some((c) => c.slug === categoryFromUrl)
        ? categoryFromUrl
        : INITIAL_FILTERS.categorySlug,
  }));

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.categorySlug !== 'all') {
          const matchCategory = p.category?.slug === filters.categorySlug;
          const matchSubCategory = p.sub_category?.slug === filters.categorySlug;
          if (!matchCategory && !matchSubCategory) return false;
        }

        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchMaterial = p.details?.material?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku && !matchMaterial) return false;
        }

        if (filters.stockStatus !== 'all' && p.stock_status !== filters.stockStatus) {
          return false;
        }

        if (p.price > filters.maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, filters]);

  const selectedCategoryObj = useMemo(() => {
    if (filters.categorySlug === 'all') return null;
    return categories.find((c) => c.slug === filters.categorySlug) || null;
  }, [categories, filters.categorySlug]);

  const subCategories = useMemo(() => {
    if (!selectedCategoryObj) return [];
    return categories.filter((c) => c.parent_id === selectedCategoryObj.id);
  }, [categories, selectedCategoryObj]);

  return (
    <div className="bg-kith-bg pb-24 transition-colors">
      {/* Header Banner */}
      <div className="border-b border-sara-red/30 bg-kith-subBg/80 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sara-red/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase">
            <Terminal className="w-3.5 h-3.5" />
            Sara Power Solution // Hardware Registry
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-kith-bone uppercase">
            Solar Equipment Catalog
          </h1>
          <p className="text-sm font-mono text-kith-muted max-w-2xl">
            Browse our inventory of Tier-1 monocrystalline solar panels, hybrid pure sine wave inverters, and LiFePO4 lithium batteries.
          </p>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            totalResults={filteredProducts.length}
          />

          <div className="flex-1 space-y-8">
            {selectedCategoryObj ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`relative overflow-hidden rounded-sm min-h-[320px] flex items-end shadow-2xl ${selectedCategoryObj.image_url ? 'bg-[#0a0a0a]' : 'bg-kith-card border border-sara-red/20'}`}>
                  {selectedCategoryObj.image_url ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10 opacity-90 pointer-events-none"></div>
                      <Image
                        src={selectedCategoryObj.image_url}
                        alt={selectedCategoryObj.name}
                        fill
                        className="absolute inset-0 object-cover z-0 opacity-80"
                      />
                    </>
                  ) : (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sara-red/5 rounded-full blur-3xl pointer-events-none z-0" />
                  )}

                  <div className="relative z-20 w-full p-8 sm:p-12">
                    <div className="w-12 h-[2px] bg-sara-red mb-6"></div>
                    <div className="flex flex-col max-w-4xl">
                      <h2 className={`text-4xl sm:text-6xl font-black font-sans uppercase leading-[0.9] tracking-widest mb-4 ${selectedCategoryObj.image_url ? 'text-white drop-shadow-2xl' : 'text-kith-bone'}`}>
                        {selectedCategoryObj.name}
                      </h2>

                      {selectedCategoryObj.description && (
                        <p className={`text-xs sm:text-sm font-mono max-w-2xl leading-relaxed ${selectedCategoryObj.image_url ? 'text-gray-300 drop-shadow-lg' : 'text-kith-muted'}`}>
                          {selectedCategoryObj.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {subCategories.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-kith-border flex-1" />
                      <h3 className="text-[10px] font-mono tracking-superwide text-sara-red dark:text-red-400 uppercase font-bold">
                        Filter By System Type
                      </h3>
                      <div className="h-px bg-kith-border flex-1" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {subCategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleFilterChange({ categorySlug: sub.slug })}
                          className="px-6 py-3 bg-kith-subBg border border-kith-border hover:border-sara-red/50 hover:bg-sara-red/5 text-xs font-mono font-bold tracking-widest text-kith-bone uppercase transition-all shadow-md group flex items-center gap-2"
                        >
                          <span>{sub.name}</span>
                          <span className="opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100 group-hover:ml-1 transition-all text-sara-red dark:text-red-400">
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 tech-panel rounded-sm border border-sara-red/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Unsure about solar system sizing?
                  </div>
                  <p className="text-xs font-mono text-kith-muted max-w-xl">
                    Use our interactive Solar Calculator to input your appliances and calculate your exact inverter and battery requirements.
                  </p>
                </div>
                <a
                  href="/calculator"
                  className="px-6 py-2.5 bg-sara-red hover:bg-sara-redLight text-white text-xs font-mono font-bold tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 flex-shrink-0 transition-all shadow-[0_0_15px_rgba(111,15,16,0.3)]"
                >
                  <span>Launch Sizer</span>
                  <span>→</span>
                </a>
              </div>
            )}

            <ProductGridSection products={filteredProducts} />
          </div>
        </div>
      </div>
    </div>
  );
};
