'use client';

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Category, FilterState } from '@/lib/types';

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleExpand = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  // Sort LIFO by created_at (newest first)
  const sortedCategories = [...categories].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  const parentCategories = sortedCategories.filter(c => !c.parent_id);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 bg-kith-card border border-kith-border p-5 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-kith-border pb-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-kith-bone font-bold flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          FILTER CATALOG ({totalResults})
        </h3>
        <button
          onClick={onReset}
          className="text-[10px] font-mono text-kith-muted hover:text-kith-bone flex items-center gap-1 uppercase"
          title="Reset Filters"
        >
          <RotateCcw className="w-3 h-3" /> RESET
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-kith-muted">
          SEARCH PRODUCTS
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search by name, material..."
            className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone placeholder-kith-darkMuted focus:outline-none focus:border-kith-bone transition-colors"
          />
          <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-kith-darkMuted" />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-kith-muted">
          CATEGORY
        </label>
        <div className="flex flex-col gap-1.5">
          {parentCategories.map((parent) => {
            const isParentSelected = filters.categorySlug === parent.slug;
            const children = sortedCategories.filter(c => c.parent_id === parent.id);
            const isChildSelected = children.some(c => c.slug === filters.categorySlug);
            
            // Auto-expand if selected, unless user explicitly toggled it
            const isExpanded = expandedParents[parent.id] ?? (isParentSelected || isChildSelected);

            return (
              <div key={parent.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFilterChange({ categorySlug: parent.slug })}
                    className={`flex-1 text-left py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between border ${
                      isParentSelected
                        ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold border-kith-btnPrimaryBg shadow-sm'
                        : 'bg-kith-subBg text-kith-muted border-kith-border hover:text-kith-bone hover:border-kith-borderLight'
                    }`}
                  >
                    <span>{parent.name}</span>
                    {isParentSelected && <span className="text-[10px]">●</span>}
                  </button>
                  
                  {children.length > 0 && (
                    <button 
                      onClick={(e) => toggleExpand(parent.id, e)}
                      className="p-2 bg-kith-subBg border border-kith-border text-kith-muted hover:text-kith-bone hover:border-kith-borderLight transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Subcategories (Collapsible) */}
                {isExpanded && children.length > 0 && (
                  <div className="flex flex-col gap-1 ml-4 pl-2 border-l border-kith-border/50 mt-0.5">
                    {children.map((child) => {
                      const isSelected = filters.categorySlug === child.slug;
                      return (
                        <button
                          key={child.id}
                          onClick={() => onFilterChange({ categorySlug: child.slug })}
                          className={`w-full text-left py-1.5 px-3 text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center justify-between border ${
                            isSelected
                              ? 'bg-kith-btnPrimaryBg text-kith-btnPrimaryText font-bold border-kith-btnPrimaryBg shadow-sm'
                              : 'bg-kith-subBg text-kith-muted border-kith-border hover:text-kith-bone hover:border-kith-borderLight'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-kith-darkMuted opacity-50 text-[10px]">↳</span>
                            {child.name}
                          </span>
                          {isSelected && <span className="text-[10px]">●</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5 border-t border-kith-border pt-4">
        <label className="text-[10px] font-mono uppercase tracking-widest text-kith-muted">
          SORT BY
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
          className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone transition-colors uppercase"
        >
          <option value="featured">FEATURED DROPS</option>
          <option value="newest">NEWEST ARRIVALS</option>
          <option value="price-asc">PRICE: LOW TO HIGH</option>
          <option value="price-desc">PRICE: HIGH TO LOW</option>
        </select>
      </div>

      {/* Stock Status Filter */}
      <div className="space-y-1.5 border-t border-kith-border pt-4">
        <label className="text-[10px] font-mono uppercase tracking-widest text-kith-muted">
          AVAILABILITY
        </label>
        <select
          value={filters.stockStatus}
          onChange={(e) => onFilterChange({ stockStatus: e.target.value })}
          className="w-full bg-kith-subBg border border-kith-border px-3 py-2 text-xs font-mono text-kith-bone focus:outline-none focus:border-kith-bone transition-colors uppercase"
        >
          <option value="all">ALL ITEMS</option>
          <option value="in_stock">IN STOCK ONLY</option>
          <option value="low_stock">LOW STOCK ONLY</option>
          <option value="preorder">PRE-ORDER ONLY</option>
        </select>
      </div>

      {/* Price Slider */}
      <div className="space-y-2 border-t border-kith-border pt-4">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-kith-muted">
          <span>MAX PRICE</span>
          <span className="text-kith-bone font-bold">{filters.maxPrice.toLocaleString()} ETB</span>
        </div>
        <input
          type="range"
          min="5000"
          max="250000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-kith-bone cursor-pointer"
        />
      </div>
    </aside>
  );
};
