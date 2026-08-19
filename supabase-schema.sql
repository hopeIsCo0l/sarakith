-- ====================================================================
-- SARA POWER SOLUTION - SUPABASE PRODUCTION DATABASE SCHEMA
-- ====================================================================
-- Description: Complete schema for Sara Power Solution energy catalog,
-- admin management, technical specification matrix, storage, and RLS.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. TABLES DEFINITIONS
-- ====================================================================

-- 2.1 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 PRODUCTS TABLE
-- Includes: Title, Stock Status, Overview (description),
-- Equipment Technical Specifications Matrix (details JSONB: brand, capacity, voltage, weight, warranty),
-- and Delivery Availability.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'ETB',
    description TEXT NOT NULL DEFAULT '',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'preorder', 'sold_out')),
    delivery_available TEXT NOT NULL DEFAULT 'Addis Ababa Delivery Available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.4 ENGINEERING SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT NOT NULL,
    specifications TEXT[] NOT NULL DEFAULT '{}',
    price_range TEXT DEFAULT 'Custom Quote',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 SOLAR ATTRIBUTES TABLE (Automated Sizing Engine)
CREATE TABLE IF NOT EXISTS public.solar_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL, -- 'inverter', 'battery', 'panel', 'package_kit'
    wattage_wp NUMERIC,
    inverter_kva NUMERIC,
    battery_capacity_kwh NUMERIC,
    min_kw_load NUMERIC NOT NULL DEFAULT 0,
    max_kw_load NUMERIC NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_solar_attributes_load ON public.solar_attributes(min_kw_load, max_kw_load);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_attributes ENABLE ROW LEVEL SECURITY;

-- 4.1 Categories Policies (Public Read, Open Write)
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Categories" ON public.categories;
CREATE POLICY "Allow Admin Write Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 4.2 Products Policies (Public Read, Open Write)
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Products" ON public.products;
CREATE POLICY "Allow Admin Write Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- 4.3 Product Images Policies (Public Read, Open Write)
DROP POLICY IF EXISTS "Public Read Product Images" ON public.product_images;
CREATE POLICY "Public Read Product Images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Product Images" ON public.product_images;
CREATE POLICY "Allow Admin Write Product Images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- 4.4 Services Policies (Public Read, Open Write)
DROP POLICY IF EXISTS "Public Read Services" ON public.services;
CREATE POLICY "Public Read Services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Services" ON public.services;
CREATE POLICY "Allow Admin Write Services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- 4.5 Solar Attributes Policies (Public Read, Open Write)
DROP POLICY IF EXISTS "Public Read Solar Attributes" ON public.solar_attributes;
CREATE POLICY "Public Read Solar Attributes" ON public.solar_attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Solar Attributes" ON public.solar_attributes;
CREATE POLICY "Allow Admin Write Solar Attributes" ON public.solar_attributes FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 5. STORAGE BUCKET CONFIGURATION (product-media)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public View Bucket Objects" ON storage.objects;
CREATE POLICY "Public View Bucket Objects" ON storage.objects
FOR SELECT USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Allow Upload Bucket Objects" ON storage.objects;
CREATE POLICY "Allow Upload Bucket Objects" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Allow Update Bucket Objects" ON storage.objects;
CREATE POLICY "Allow Update Bucket Objects" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Allow Delete Bucket Objects" ON storage.objects;
CREATE POLICY "Allow Delete Bucket Objects" ON storage.objects
FOR DELETE USING (bucket_id = 'product-media');

-- ====================================================================
-- 6. INITIAL SEED DATA
-- ====================================================================

-- 6.1 Seed Categories
INSERT INTO public.categories (id, name, slug, description, display_order)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Solar Inverters', 'inverters', 'Pure sine wave hybrid and off-grid solar power inverters', 1),
    ('22222222-2222-2222-2222-222222222222', 'Batteries & Storage', 'batteries', 'Deep-cycle LiFePO4 lithium batteries and gel power storage units', 2),
    ('33333333-3333-3333-3333-333333333333', 'Solar Panels', 'solar-panels', 'Tier-1 high efficiency monocrystalline solar PV panels', 3),
    ('44444444-4444-4444-4444-444444444444', 'Water Pumps & Controllers', 'water-pumps', 'Solar submersible pumps and MPPT pump controllers', 4)
ON CONFLICT (slug) DO NOTHING;

-- 6.2 Seed Products with Technical Specification Matrix
INSERT INTO public.products (
    id, category_id, name, slug, sku, price, currency, description, details, is_featured, is_visible, stock_status, delivery_available
)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Must 5.5kW Hybrid Solar Inverter (48V)',
    'must-5-5kw-hybrid-solar-inverter-48v',
    'SEB-INV-5500',
    0,
    'ETB',
    'High performance 5500W pure sine wave hybrid solar inverter with integrated 100A MPPT solar charge controller. Designed for reliable residential and commercial backup.',
    '{
        "brand": "Must Energy / Sara Power Tier-1",
        "capacity": "5500W Continuous / 11000W Surge",
        "voltage": "48VDC Input / 230VAC 50Hz Output",
        "weight": "11.5 kg",
        "warranty": "2-Year Full Replacement Warranty",
        "delivery_available": "Addis Ababa Delivery Available"
    }'::jsonb,
    true,
    true,
    'in_stock',
    'Addis Ababa Delivery Available'
),
(
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Felicity 51.2V 100Ah 5kWh LiFePO4 Lithium Battery Pack',
    'felicity-51-2v-100ah-5kwh-lifepo4-battery',
    'SEB-BAT-5KWH',
    0,
    'ETB',
    'Wall mounted 5.12kWh Lithium Iron Phosphate (LiFePO4) solar energy storage pack. Built in smart BMS protection with over 6,000 deep discharge cycles at 80% DOD.',
    '{
        "brand": "Felicity Solar / Sara Power Storage",
        "capacity": "100Ah / 5.12 kWh Usable Energy",
        "voltage": "51.2V Nominal (44.8V - 57.6V Range)",
        "weight": "48 kg",
        "warranty": "5-Year Manufacturer Warranty / 6000+ Cycles",
        "delivery_available": "Addis Ababa Delivery Available"
    }'::jsonb,
    true,
    true,
    'in_stock',
    'Addis Ababa Delivery Available'
),
(
    'a3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Jinko Tiger Neo 550W N-Type TOPCon Monocrystalline Solar Panel',
    'jinko-tiger-neo-550w-topcon-solar-panel',
    'SEB-PAN-550W',
    0,
    'ETB',
    'Ultra-high efficiency 550W N-type TOPCon monocrystalline solar module. Features low degradation rate, superior low-light performance, and IP68 junction box rating.',
    '{
        "brand": "Jinko Solar (Tier-1 Bloomberg Approved)",
        "capacity": "550W Peak Power Rating",
        "voltage": "42.22V Vmp / 50.34V Voc",
        "weight": "28.0 kg",
        "warranty": "12-Year Product / 30-Year Linear Power Warranty",
        "delivery_available": "Addis Ababa & Regional Delivery Available"
    }'::jsonb,
    true,
    true,
    'in_stock',
    'Addis Ababa & Regional Delivery Available'
),
(
    'a4444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Solar Submersible Deep Well Water Pump 3HP with MPPT VFD Controller',
    'solar-submersible-deep-well-water-pump-3hp',
    'SEB-PMP-3HP',
    0,
    'ETB',
    'High head solar submersible borehole water pump kit with variable frequency drive (VFD) MPPT inverter controller for agricultural irrigation and livestock watering.',
    '{
        "brand": "Sara Power Flow Pro",
        "capacity": "3HP (2.2 kW) / 15,000 Liters per Hour Max",
        "voltage": "3-Phase 220V AC / 380V AC Solar Direct",
        "weight": "19.5 kg",
        "warranty": "2-Year Complete Unit Warranty",
        "delivery_available": "Nationwide Logistics Available"
    }'::jsonb,
    true,
    true,
    'in_stock',
    'Nationwide Logistics Available'
)
ON CONFLICT (slug) DO NOTHING;

-- 6.3 Seed Product Images
INSERT INTO public.product_images (product_id, url, alt_text, is_primary, display_order)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000&auto=format&fit=crop',
    'Must 5.5kW Hybrid Solar Inverter',
    true,
    0
),
(
    'a2222222-2222-2222-2222-222222222222',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop',
    'Felicity 51.2V 100Ah LiFePO4 Lithium Battery Pack',
    true,
    0
),
(
    'a3333333-3333-3333-3333-333333333333',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1000&auto=format&fit=crop',
    'Jinko Tiger Neo 550W Solar Panel',
    true,
    0
),
(
    'a4444444-4444-4444-4444-444444444444',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1000&auto=format&fit=crop',
    'Solar Submersible Water Pump 3HP',
    true,
    0
)
ON CONFLICT DO NOTHING;

-- 6.4 Seed Engineering Services
INSERT INTO public.services (id, title, slug, subtitle, description, specifications, price_range, is_active, display_order)
VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'Turnkey Solar Power System Sizing & Installation',
    'turnkey-solar-installation',
    'Residential & Commercial Solar Deployments',
    'Complete engineering, procurement, and construction (EPC) for off-grid, hybrid, and grid-tied solar photovoltaic systems across residential homes, commercial facilities, and remote locations.',
    ARRAY[
        'Electrical load profile audit and kW/kWh consumption modeling',
        'Custom PV array string sizing and roof/ground mounting structural engineering',
        'Hybrid inverter configuration with lithium storage integration',
        'Earthing, lightning arrestor protection, and DC/AC distribution panels',
        'Commissioning, handover documentation, and local utility compliance'
    ],
    'Custom Engineering Quote',
    true,
    1
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Solar Water Pumping & Agricultural Irrigation Systems',
    'solar-water-pumping-systems',
    'Deep Well Boreholes & Surface Irrigation',
    'Specialized solar water extraction solutions for deep well boreholes, surface water reservoirs, and drip irrigation networks designed for high solar yield without diesel fuel expense.',
    ARRAY[
        'Hydrogeological head (m) and required flow rate (m³/day) analysis',
        'MPPT VFD pump inverter matching for AC submersible and helical pumps',
        'Sensor-automated water tank level and dry-run pump protection',
        'Galvanized tracker and fixed mounting structures designed for high wind load',
        'On-site installation and flow rate verification across Ethiopian regions'
    ],
    'Project Based',
    true,
    2
),
(
    'b3333333-3333-3333-3333-333333333333',
    'Solar Battery Bank & Inverter Maintenance & Upgrades',
    'battery-inverter-maintenance-upgrades',
    'Diagnostic, Repair & Capacity Expansion',
    'Comprehensive health checks, BMS calibration, and capacity expansion for existing solar installations. We upgrade outdated lead-acid banks to modern LiFePO4 lithium packs.',
    ARRAY[
        'BMS telemetry analysis, cell voltage balancing, and state-of-health (SOH) testing',
        'Inverter firmware updates and MPPT tracking efficiency optimization',
        'Safe replacement and parallel synchronization of lithium battery modules',
        'Thermal imaging inspection of electrical panels and MC4 connectors',
        'Scheduled preventative maintenance contracts with rapid SLA response'
    ],
    'Service Diagnostic Rate',
    true,
    3
),
(
    'b4444444-4444-4444-4444-444444444444',
    'Commercial & Industrial Solar Micro-Grids & Diesel Hybrid Systems',
    'commercial-micro-grids-diesel-hybrid',
    'High-Capacity Hybrid Power for Factories & Estates',
    'Scalable multi-kilowatt and megawatt micro-grid architectures combining solar PV, battery energy storage systems (BESS), and automated diesel generator synchronization.',
    ARRAY[
        'Micro-grid controller deployment with smart zero-export and fuel-saver modes',
        'High-voltage three-phase (380V/400V) parallel inverter clustering up to 100kW+',
        'Containerized commercial LiFePO4 BESS integration',
        'SCADA telemetry monitoring with remote cloud management',
        'Levelized cost of energy (LCOE) financial modeling and ROI projections'
    ],
    'Enterprise EPC Contract',
    true,
    4
)
ON CONFLICT (slug) DO NOTHING;

-- 6.5 Seed Solar Attributes for Load Calculator
INSERT INTO public.solar_attributes (product_id, product_type, min_kw_load, max_kw_load, inverter_kva, battery_capacity_kwh, wattage_wp)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'package_kit',
    2.5,
    6.0,
    5.5,
    5.12,
    3300
)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- 7. ENABLE REALTIME BROADCASTING
-- ====================================================================
-- Enables Supabase Realtime engine for instant live data streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
