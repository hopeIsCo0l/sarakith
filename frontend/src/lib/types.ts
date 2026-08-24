export type StockStatus = 'in_stock' | 'low_stock' | 'preorder' | 'sold_out';

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  display_order: number;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductDetails {
  brand?: string;
  capacity?: string;
  voltage?: string;
  weight?: string;
  warranty?: string;
  power_output?: string;
  dimensions?: string;
  delivery_available?: string;
  [key: string]: string | undefined;
}

export interface SolarAttribute {
  id: string;
  product_id: string;
  product_type: string;
  wattage_wp?: number;
  inverter_kva?: number;
  battery_capacity_kwh?: number;
  min_kw_load: number;
  max_kw_load: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string;
  category?: Category;
  sub_category_id?: string | null;
  sub_category?: Category;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  currency: string;
  description: string;
  details?: ProductDetails;
  is_featured: boolean;
  is_visible: boolean;
  stock_status: StockStatus;
  delivery_available?: string | boolean;
  images: ProductImage[];
  solar_attributes?: SolarAttribute[];
  created_at: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  specifications: string[];
  price_range?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface FilterState {
  categorySlug: string;
  searchQuery: string;
  stockStatus: string;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface SiteSetting {
  key: string;
  name: string;
  url: string;
  category: 'logo' | 'banner' | 'favicon' | 'branding' | string;
  alt_text?: string;
  recommended_dimensions?: string;
  updated_at?: string;
}
