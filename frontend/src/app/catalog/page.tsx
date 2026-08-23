'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getCategories, getProducts, supabase } from '@/lib/supabase';
import { Category, FilterState, Product } from '@/lib/types';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ProductGrid } from '@/components/ProductGrid';
import { QuickViewModal } from '@/components/QuickViewModal';
import { Zap, Sun, Terminal } from 'lucide-react';

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

  const initialFilters: FilterState = {
    categorySlug: 'all',
    searchQuery: '',
    stockStatus: 'all',
    maxPrice: 250000,
    sortBy: 'featured',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    async function loadData() {
      const cats = await getCategories();
      const prods = await getProducts();
      setCategories(cats);
      setAllProducts(prods);
    }
    loadData();

    // 1. Instant re-fetch on window focus
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);

    // 2. Cross-tab & intra-window broadcast sync
    const broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sara_power_sync') : null;
    if (broadcast) {
      broadcast.onmessage = () => loadData();
    }
    window.addEventListener('sara_data_updated', loadData);

    // 3. Live Supabase Realtime Postgres Changes Subscription
    let channel: any;
    if (supabase) {
      channel = supabase
        .channel('realtime_catalog_page')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
          loadData();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('sara_data_updated', loadData);
      if (broadcast) broadcast.close();
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Category filter
        if (filters.categorySlug !== 'all') {
          const matchCategory = p.category?.slug === filters.categorySlug;
          const matchSubCategory = p.sub_category?.slug === filters.categorySlug;
          
          if (!matchCategory && !matchSubCategory) {
            return false;
          }
        }

        // Search query filter (matches name, description, SKU, details)
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchMaterial = p.details?.material?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchSku && !matchMaterial) return false;
        }

        // Stock status filter
        if (filters.stockStatus !== 'all' && p.stock_status !== filters.stockStatus) {
          return false;
        }

        // Max price filter
        if (p.price > filters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'newest')
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [allProducts, filters]);

  // Category Details Resolution
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
        {/* Main Layout: Sticky Sidebar + 4-Column Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            totalResults={filteredProducts.length}
          />

          <div className="flex-1 space-y-8">
            
            {/* Conditional Category Header or Global Banner */}
            {selectedCategoryObj ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Category Header Block */}
                <div className="bg-kith-card border border-sara-red/20 p-8 sm:p-12 flex flex-col items-center text-center space-y-4 shadow-[0_0_20px_rgba(111,15,16,0.05)] relative overflow-hidden rounded-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sara-red/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center rounded-sm z-10">
                    <Zap className="w-5 h-5 text-sara-red dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black font-mono tracking-widest text-kith-bone uppercase z-10">
                    {selectedCategoryObj.name}
                  </h2>
                  {selectedCategoryObj.description && (
                    <p className="text-sm font-mono text-kith-muted max-w-2xl leading-relaxed z-10">
                      {selectedCategoryObj.description}
                    </p>
                  )}
                </div>

                {/* Sub-Category Pills */}
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
              /* FR-2 Solar Calculator Callout Banner (Only shows when "All Items" is selected) */
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

            <ProductGrid
              products={filteredProducts}
              onQuickView={(product) => setSelectedQuickView(product)}
            />
          </div>
        </div>
      </div>

      {/* Quick View Modal Overlay */}
      <QuickViewModal
        product={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
      />
    </div>
  );
}
