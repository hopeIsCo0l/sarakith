import { createClient } from '@supabase/supabase-js';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SERVICES } from './mockData';
import { Category, Product, Service } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if a string is a valid UUID v4 format
 */
export function isValidUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Diagnostic utility to test Supabase connection, schema, and record counts
 */
export async function getDatabaseDiagnostics(): Promise<{
  connected: boolean;
  url: string;
  categoriesCount: number;
  productsCount: number;
  servicesCount: number;
  error: string | null;
}> {
  if (!supabase) {
    return {
      connected: false,
      url: supabaseUrl || 'NOT_CONFIGURED',
      categoriesCount: 0,
      productsCount: 0,
      servicesCount: 0,
      error: 'Supabase credentials missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
    };
  }

  try {
    const [catsRes, prodsRes, srvsRes] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }),
    ]);

    const firstError = catsRes.error || prodsRes.error || srvsRes.error;
    if (firstError) {
      return {
        connected: false,
        url: supabaseUrl,
        categoriesCount: catsRes.count ?? 0,
        productsCount: prodsRes.count ?? 0,
        servicesCount: srvsRes.count ?? 0,
        error: `Supabase Error: ${firstError.message} (${firstError.code || 'NO_CODE'}). Please run supabase-schema.sql in Supabase SQL editor.`,
      };
    }

    return {
      connected: true,
      url: supabaseUrl,
      categoriesCount: catsRes.count ?? 0,
      productsCount: prodsRes.count ?? 0,
      servicesCount: srvsRes.count ?? 0,
      error: null,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: supabaseUrl,
      categoriesCount: 0,
      productsCount: 0,
      servicesCount: 0,
      error: err?.message || String(err),
    };
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  if (!supabase) return MOCK_CATEGORIES;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase getCategories query failed, falling back to mock:', error.message);
      return MOCK_CATEGORIES;
    }
    
    if (!data || data.length === 0) {
      return MOCK_CATEGORIES;
    }
    return data as Category[];
  } catch (err) {
    console.warn('Supabase fetch failed, fallback to mock categories', err);
    return MOCK_CATEGORIES;
  }
}

/**
 * Fetch products with image relations
 */
export async function getProducts(options?: {
  categorySlug?: string;
  isFeatured?: boolean;
}): Promise<Product[]> {
  if (!supabase) {
    let result = MOCK_PRODUCTS;
    if (options?.categorySlug && options.categorySlug !== 'all') {
      result = result.filter((p) => p.category?.slug === options.categorySlug);
    }
    if (options?.isFeatured) {
      result = result.filter((p) => p.is_featured);
    }
    return result;
  }

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories!category_id(*),
        sub_category:categories!sub_category_id(*),
        images:product_images(*)
      `)
      .order('created_at', { ascending: false });

    if (options?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Supabase getProducts query failed, falling back to mock:', error.message);
      return MOCK_PRODUCTS;
    }

    if (!data || data.length === 0) {
      return MOCK_PRODUCTS;
    }

    let products = data as Product[];
    if (options?.categorySlug && options.categorySlug !== 'all') {
      products = products.filter((p) => p.category?.slug === options.categorySlug);
    }
    return products;
  } catch (err) {
    console.warn('Supabase fetch failed, fallback to mock products', err);
    return MOCK_PRODUCTS;
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories!category_id(*),
        sub_category:categories!sub_category_id(*),
        images:product_images(*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
    }
    return data as Product;
  } catch (err) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

/**
 * Fetch dynamic solar packages based on kW load
 */
export async function getDynamicSolarPackages(kwLoad: number): Promise<Product[]> {
  const getMockMatches = () => {
    return MOCK_PRODUCTS.filter(p => {
      if (!p.solar_attributes || p.solar_attributes.length === 0) return false;
      return p.solar_attributes.some(attr => attr.min_kw_load <= kwLoad && attr.max_kw_load >= kwLoad);
    });
  };

  if (!supabase) {
    return getMockMatches();
  }

  try {
    const { data, error } = await supabase
      .from('solar_attributes')
      .select(`
        *,
        product:products(
          *,
          category:categories!category_id(*),
          sub_category:categories!sub_category_id(*),
          images:product_images(*)
        )
      `)
      .lte('min_kw_load', kwLoad)
      .gte('max_kw_load', kwLoad)
      .eq('product_type', 'package_kit');

    if (error || !data || data.length === 0) {
      return getMockMatches();
    }

    return data.map((row: any) => ({
      ...row.product,
      solar_attributes: [{
        id: row.id,
        product_id: row.product_id,
        product_type: row.product_type,
        wattage_wp: row.wattage_wp,
        inverter_kva: row.inverter_kva,
        battery_capacity_kwh: row.battery_capacity_kwh,
        min_kw_load: row.min_kw_load,
        max_kw_load: row.max_kw_load,
        created_at: row.created_at
      }]
    })) as Product[];
  } catch (err) {
    return getMockMatches();
  }
}

/**
 * Fetch active services
 */
export async function getServices(): Promise<Service[]> {
  if (!supabase) return MOCK_SERVICES;

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_SERVICES;
    return data as Service[];
  } catch (err) {
    return MOCK_SERVICES;
  }
}

// ----------------------------------------------------------------------
// ADMIN MUTATION METHODS (CREATE, UPDATE, DELETE)
// ----------------------------------------------------------------------

/**
 * Upload an image file with automatic Base64 Data URL fallback
 */
export async function uploadImageToSupabase(file: File, folderPrefix?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const convertToBase64 = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    if (!supabase) {
      return convertToBase64();
    }

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const filename = folderPrefix ? `${folderPrefix}_${Date.now()}_${cleanName}` : `${Date.now()}_${cleanName}`;

    supabase.storage
      .from('product-media')
      .upload(filename, file, { upsert: true })
      .then(({ data, error }) => {
        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('product-media')
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return resolve(publicUrlData.publicUrl);
          }
        }
        convertToBase64();
      })
      .catch(() => {
        convertToBase64();
      });
  });
}

/**
 * Create a new product in Supabase with multiple images
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'created_at' | 'images' | 'category'>,
  imageUrls: string[]
): Promise<{ product: Product | null; error: string | null }> {
  if (!supabase) {
    return {
      product: {
        id: `prod-${Date.now()}`,
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        price: productData.price,
        currency: 'ETB',
        category_id: productData.category_id,
        description: productData.description,
        details: productData.details || {},
        is_featured: productData.is_featured,
        is_visible: true,
        stock_status: productData.stock_status,
        created_at: new Date().toISOString(),
        images: imageUrls.map((url, i) => ({
          id: `img-${Date.now()}-${i}`,
          product_id: `prod-${Date.now()}`,
          url,
          is_primary: i === 0,
          display_order: i,
        })),
      },
      error: null,
    };
  }

  try {
    const validCategoryId = isValidUUID(productData.category_id) ? productData.category_id : null;

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        category_id: validCategoryId,
        sub_category_id: productData.sub_category_id || null,
        name: productData.name,
        slug: productData.slug,
        sku: productData.sku,
        price: productData.price,
        currency: productData.currency || 'ETB',
        description: productData.description,
        details: productData.details || {},
        is_featured: productData.is_featured,
        is_visible: productData.is_visible,
        stock_status: productData.stock_status,
      })
      .select(`
        *,
        category:categories!category_id(*),
        sub_category:categories!sub_category_id(*)
      `)
      .single();

    if (prodError || !prodData) {
      console.error('Error inserting product in Supabase:', prodError);
      return { product: null, error: prodError?.message || 'Database insert failed' };
    }

    const productId = prodData.id;

    // Insert multiple image records
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, index) => ({
        product_id: productId,
        url,
        is_primary: index === 0,
        display_order: index,
      }));

      await supabase.from('product_images').insert(imageRecords);
    }

    const fullProduct: Product = {
      ...(prodData as Product),
      images: imageUrls.map((url, index) => ({
        id: `img-${index}`,
        product_id: productId,
        url,
        is_primary: index === 0,
        display_order: index,
      })),
    };

    return { product: fullProduct, error: null };
  } catch (err: any) {
    console.error('Exception creating product:', err);
    return { product: null, error: err?.message || String(err) };
  }
}

/**
 * Update an existing product and optional image set
 */
export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  imageUrls?: string[]
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const validCategoryId = isValidUUID(updates.category_id) ? updates.category_id : undefined;

    const updatePayload: Record<string, any> = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(validCategoryId !== undefined && { category_id: validCategoryId }),
      ...(updates.sub_category_id !== undefined && { sub_category_id: updates.sub_category_id || null }),
      ...(updates.price !== undefined && { price: updates.price }),
      ...(updates.stock_status !== undefined && { stock_status: updates.stock_status }),
      ...(updates.is_featured !== undefined && { is_featured: updates.is_featured }),
      ...(updates.is_visible !== undefined && { is_visible: updates.is_visible }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.sku !== undefined && { sku: updates.sku }),
      ...(updates.details !== undefined && { details: updates.details }),
    };

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Error updating product in Supabase:', error);
      return { success: false, error: error.message };
    }

    // If new images provided, refresh product images
    if (imageUrls && imageUrls.length > 0 && isValidUUID(id)) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const imageRecords = imageUrls.map((url, index) => ({
        product_id: id,
        url,
        is_primary: index === 0,
        display_order: index,
      }));
      await supabase.from('product_images').insert(imageRecords);
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Failed to update product:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    if (isValidUUID(id)) {
      await supabase.from('product_images').delete().eq('product_id', id);
    }
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Create a new Category
 */
export async function createCategory(cat: Omit<Category, 'id' | 'created_at'>): Promise<{ category: Category | null; error: string | null }> {
  if (!supabase) {
    return {
      category: {
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...cat,
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase.from('categories').insert(cat).select().single();
    if (error || !data) {
      console.error('Error creating category in Supabase:', error);
      return { category: null, error: error?.message || 'Failed to create category' };
    }
    return { category: data as Category, error: null };
  } catch (err: any) {
    return { category: null, error: err?.message || String(err) };
  }
}

/**
 * Update an existing Category
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating category in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a Category by ID
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Create a new Service
 */
export async function createService(service: Omit<Service, 'id' | 'created_at'>): Promise<{ service: Service | null; error: string | null }> {
  if (!supabase) {
    return {
      service: {
        id: `srv-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...service,
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase.from('services').insert(service).select().single();
    if (error || !data) {
      console.error('Error creating service in Supabase:', error);
      return { service: null, error: error?.message || 'Failed to create service' };
    }
    return { service: data as Service, error: null };
  } catch (err: any) {
    return { service: null, error: err?.message || String(err) };
  }
}

/**
 * Update an existing Service
 */
export async function updateService(id: string, updates: Partial<Service>): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase.from('services').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating service in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Delete a Service by ID
 */
export async function deleteService(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('Error deleting service in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ----------------------------------------------------------------------
// SITE SETTINGS & BRANDING MANAGED ASSETS
// ----------------------------------------------------------------------

export const DEFAULT_SITE_SETTINGS: Record<string, { key: string; name: string; url: string; category: string; alt_text?: string; recommended_dimensions?: string }> = {
  logo_light: {
    key: 'logo_light',
    name: 'Light Mode Primary Logo',
    url: '/logo.png',
    category: 'logo',
    alt_text: 'Sara Power Solution Light Logo',
    recommended_dimensions: '512 x 512 px (1:1 Ratio, Transparent PNG or SVG)',
  },
  logo_dark: {
    key: 'logo_dark',
    name: 'Dark Mode Primary Logo',
    url: '/logo.png',
    category: 'logo',
    alt_text: 'Sara Power Solution Dark Logo',
    recommended_dimensions: '512 x 512 px (1:1 Ratio, Transparent PNG or SVG)',
  },
  hero_banner_light_1: {
    key: 'hero_banner_light_1',
    name: 'Light Mode Hero Banner (Slide 1)',
    url: '/cinematic_hero.png',
    category: 'banner',
    alt_text: 'Light Theme Hero Slide 1',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_light_2: {
    key: 'hero_banner_light_2',
    name: 'Light Mode Hero Banner (Slide 2)',
    url: '',
    category: 'banner',
    alt_text: 'Light Theme Hero Slide 2',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_light_3: {
    key: 'hero_banner_light_3',
    name: 'Light Mode Hero Banner (Slide 3)',
    url: '',
    category: 'banner',
    alt_text: 'Light Theme Hero Slide 3',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_light_4: {
    key: 'hero_banner_light_4',
    name: 'Light Mode Hero Banner (Slide 4)',
    url: '',
    category: 'banner',
    alt_text: 'Light Theme Hero Slide 4',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_dark_1: {
    key: 'hero_banner_dark_1',
    name: 'Dark Mode Hero Banner (Slide 1)',
    url: '/cinematic_hero.png',
    category: 'banner',
    alt_text: 'Dark Theme Hero Slide 1',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_dark_2: {
    key: 'hero_banner_dark_2',
    name: 'Dark Mode Hero Banner (Slide 2)',
    url: '',
    category: 'banner',
    alt_text: 'Dark Theme Hero Slide 2',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_dark_3: {
    key: 'hero_banner_dark_3',
    name: 'Dark Mode Hero Banner (Slide 3)',
    url: '',
    category: 'banner',
    alt_text: 'Dark Theme Hero Slide 3',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  hero_banner_dark_4: {
    key: 'hero_banner_dark_4',
    name: 'Dark Mode Hero Banner (Slide 4)',
    url: '',
    category: 'banner',
    alt_text: 'Dark Theme Hero Slide 4',
    recommended_dimensions: '1920 x 1080 px (Edge-to-Edge Cinematic, WebP/JPEG, < 600KB)',
  },
  catalog_banner: {
    key: 'catalog_banner',
    name: 'Equipment Catalog Header Banner',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=1600&auto=format&fit=crop',
    category: 'banner',
    alt_text: 'Solar Equipment Catalog Header',
    recommended_dimensions: '1920 x 600 px (16:5 Wide Banner, WebP/JPEG, < 500KB)',
  },
  services_banner: {
    key: 'services_banner',
    name: 'Solar Engineering Services Banner',
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1600&auto=format&fit=crop',
    category: 'banner',
    alt_text: 'Engineering Services Header',
    recommended_dimensions: '1920 x 600 px (16:5 Wide Banner, WebP/JPEG, < 500KB)',
  },
  calculator_banner: {
    key: 'calculator_banner',
    name: 'Solar Load Calculator Banner',
    url: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=1600&auto=format&fit=crop',
    category: 'banner',
    alt_text: 'Solar Sizing Engine Header',
    recommended_dimensions: '1920 x 600 px (16:5 Wide Banner, WebP/JPEG, < 500KB)',
  },
  company_name: {
    key: 'company_name',
    name: 'Company Official Name',
    url: 'Sara Power Solution PLC',
    category: 'company',
    alt_text: 'Official registered company title',
  },
  about_mission: {
    key: 'about_mission',
    name: 'Company Mission & Overview',
    url: "Sara Power Solution PLC is Ethiopia's premier distributor and systems engineering contractor for high-efficiency monocrystalline solar panels, pure sine wave hybrid inverters, and high-voltage LiFePO4 battery energy storage.",
    category: 'about',
    alt_text: 'Full company mission statement',
  },
  about_vision: {
    key: 'about_vision',
    name: 'Company Vision Statement',
    url: 'Powering homes, commercial facilities, and agricultural projects across Ethiopia with reliable, clean solar energy.',
    category: 'about',
    alt_text: 'Company long-term vision',
  },
  contact_address: {
    key: 'contact_address',
    name: 'Physical Showroom & Office Address',
    url: 'Sara Building, Lideta Sub-City, Addis Ababa, Ethiopia',
    category: 'contact',
    alt_text: 'Headquarters physical address',
  },
  contact_phone_primary: {
    key: 'contact_phone_primary',
    name: 'Primary Contact Phone',
    url: '+251 91 123 4567',
    category: 'contact',
    alt_text: 'Main hotline phone number',
  },
  contact_phone_secondary: {
    key: 'contact_phone_secondary',
    name: 'Secondary Contact Phone',
    url: '+251 91 765 4321',
    category: 'contact',
    alt_text: 'Alternative hotline phone number',
  },
  contact_email: {
    key: 'contact_email',
    name: 'Official Email Address',
    url: 'info@sarapowersolution.com',
    category: 'contact',
    alt_text: 'Official contact email',
  },
  contact_business_hours: {
    key: 'contact_business_hours',
    name: 'Business Operating Hours',
    url: 'Mon - Sat: 8:00 AM - 6:00 PM (Local Time)',
    category: 'contact',
    alt_text: 'Weekly operating hours',
  },
  contact_whatsapp: {
    key: 'contact_whatsapp',
    name: 'WhatsApp Direct Contact Link',
    url: 'https://wa.me/251911234567',
    category: 'contact',
    alt_text: 'Direct WhatsApp chat URL',
  },
  social_telegram: {
    key: 'social_telegram',
    name: 'Telegram Official Channel / Group',
    url: 'https://t.me/sarapower',
    category: 'social',
    alt_text: 'Telegram Official Link',
  },
  social_instagram: {
    key: 'social_instagram',
    name: 'Instagram Official Profile',
    url: 'https://instagram.com/sarapower',
    category: 'social',
    alt_text: 'Instagram Official Link',
  },
  social_tiktok: {
    key: 'social_tiktok',
    name: 'TikTok Official Page',
    url: 'https://tiktok.com/@sarapower',
    category: 'social',
    alt_text: 'TikTok Official Link',
  },
  social_linkedin: {
    key: 'social_linkedin',
    name: 'LinkedIn Company Page',
    url: 'https://linkedin.com/company/sarapower',
    category: 'social',
    alt_text: 'LinkedIn Official Link',
  },
  stat_installed_mw: {
    key: 'stat_installed_mw',
    name: 'Installed Capacity Metric',
    url: '5.5+ MW',
    category: 'about',
    alt_text: 'Total installed capacity in megawatts',
  },
  stat_completed_projects: {
    key: 'stat_completed_projects',
    name: 'Completed Projects Count',
    url: '500+',
    category: 'about',
    alt_text: 'Total completed solar installations',
  },
  stat_warranty_years: {
    key: 'stat_warranty_years',
    name: 'Standard Local Warranty',
    url: '5 YEARS',
    category: 'about',
    alt_text: 'Official local warranty duration',
  },
};

/**
 * Fetch all site settings / branding images
 */
export async function getSiteSettings(): Promise<Record<string, { key: string; name: string; url: string; category: string; alt_text?: string }>> {
  if (!supabase) return DEFAULT_SITE_SETTINGS;

  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error || !data || data.length === 0) return DEFAULT_SITE_SETTINGS;

    const settingsMap: Record<string, any> = { ...DEFAULT_SITE_SETTINGS };
    data.forEach((item: any) => {
      settingsMap[item.key] = item;
    });
    return settingsMap;
  } catch (err) {
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Upsert a site setting / branding image record
 */
export async function updateSiteSetting(
  key: string,
  name: string,
  url: string,
  category: string = 'branding',
  alt_text?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: true, error: null };

  try {
    const { error } = await supabase.from('site_settings').upsert({
      key,
      name,
      url,
      category,
      alt_text: alt_text || name,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error updating site setting in Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}
