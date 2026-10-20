-- ==============================================================================
-- DEPRECATED — kept for reference only.
-- For new databases use supabase-schema.sql, then apply the migrations in
-- supabase/migrations/. For existing databases apply
-- 20261019000000_security_hardening.sql.
-- ==============================================================================
-- Sara Power Solution plc — Complete PostgreSQL Database Schema
-- Supabase Schema for Products, Categories, Services, Images & Solar Attributes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    description TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    stock_status VARCHAR(50) DEFAULT 'in_stock', -- 'in_stock', 'low_stock', 'preorder', 'sold_out'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Product Images Table (Multiple Photos per Item)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Technical Solar Sizing Attributes (FR-2 & FR-3 Engine)
CREATE TABLE IF NOT EXISTS solar_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL, -- 'panel', 'inverter', 'battery', 'package_kit'
    wattage_wp NUMERIC(8, 2),
    inverter_kva NUMERIC(8, 2),
    battery_capacity_kwh NUMERIC(8, 2),
    min_kw_load NUMERIC(8, 2) NOT NULL DEFAULT 0.5,
    max_kw_load NUMERIC(8, 2) NOT NULL DEFAULT 15.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle TEXT,
    description TEXT NOT NULL,
    specifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_range VARCHAR(100) DEFAULT 'Custom Quote',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indices for Fast Search & Sizing Querying
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_solar_attributes_load ON solar_attributes(min_kw_load, max_kw_load);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE solar_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active catalog items
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read on product_images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read on solar_attributes" ON solar_attributes FOR SELECT USING (true);
CREATE POLICY "Allow public read on services" ON services FOR SELECT USING (is_active = true);
