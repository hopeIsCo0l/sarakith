-- ====================================================================
-- Sara Power Solution plc — Phase 1 Security Hardening Migration
-- ====================================================================
-- Replaces the permissive "WITH CHECK (true)" policies with an
-- authenticated admin allowlist. Public users keep read access to the
-- published catalog; anonymous writes are removed everywhere.
--
-- Apply this migration after deploying the Supabase Auth admin login.
-- Create the first admin user in Supabase Dashboard > Authentication,
-- then run the INSERT at the bottom of this file with that email.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ADMIN ALLOWLIST
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No RLS policies on admin_users: only the service role (backend/SQL
-- editor) can manage this table. The is_admin() function below bypasses
-- RLS because it is SECURITY DEFINER.
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
GRANT SELECT ON TABLE public.admin_users TO service_role;

-- --------------------------------------------------------------------
-- 2. ADMIN CHECK FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- --------------------------------------------------------------------
-- 3. CATEGORIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow Admin Write Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 4. PRODUCTS
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public read visible products" ON public.products;
CREATE POLICY "Public read visible products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (is_visible = true);

DROP POLICY IF EXISTS "Allow Admin Write Products" ON public.products;
DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products"
    ON public.products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 5. PRODUCT IMAGES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Public read images of visible products" ON public.product_images;
CREATE POLICY "Public read images of visible products"
    ON public.product_images FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = product_images.product_id
              AND p.is_visible = true
        )
    );

DROP POLICY IF EXISTS "Allow Admin Write Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin manage product images" ON public.product_images;
CREATE POLICY "Admin manage product images"
    ON public.product_images FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 6. SERVICES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Services" ON public.services;
DROP POLICY IF EXISTS "Public read active services" ON public.services;
CREATE POLICY "Public read active services"
    ON public.services FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Allow Admin Write Services" ON public.services;
DROP POLICY IF EXISTS "Admin manage services" ON public.services;
CREATE POLICY "Admin manage services"
    ON public.services FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 7. SOLAR ATTRIBUTES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Read Solar Attributes" ON public.solar_attributes;
DROP POLICY IF EXISTS "Public read attributes of visible products" ON public.solar_attributes;
CREATE POLICY "Public read attributes of visible products"
    ON public.solar_attributes FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.products p
            WHERE p.id = solar_attributes.product_id
              AND p.is_visible = true
        )
    );

DROP POLICY IF EXISTS "Allow Admin Write Solar Attributes" ON public.solar_attributes;
DROP POLICY IF EXISTS "Admin manage solar attributes" ON public.solar_attributes;
CREATE POLICY "Admin manage solar attributes"
    ON public.solar_attributes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 8. SITE SETTINGS
-- --------------------------------------------------------------------
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings"
    ON public.site_settings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow all access to site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin manage site settings" ON public.site_settings;
CREATE POLICY "Admin manage site settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- --------------------------------------------------------------------
-- 9. STORAGE (product-media bucket)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public View Bucket Objects" ON storage.objects;
DROP POLICY IF EXISTS "Public read product-media" ON storage.objects;
CREATE POLICY "Public read product-media"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Allow Upload Bucket Objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product-media" ON storage.objects;
CREATE POLICY "Admin upload product-media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-media' AND public.is_admin());

DROP POLICY IF EXISTS "Allow Update Bucket Objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin update product-media" ON storage.objects;
CREATE POLICY "Admin update product-media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'product-media' AND public.is_admin());

DROP POLICY IF EXISTS "Allow Delete Bucket Objects" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product-media" ON storage.objects;
CREATE POLICY "Admin delete product-media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-media' AND public.is_admin());

-- --------------------------------------------------------------------
-- 10. CONTACT DETAILS
-- --------------------------------------------------------------------
-- Sara Power Solution publishes a single phone number, one company email
-- address and one WhatsApp line. Remove the retired secondary line and
-- normalise the stored values when they still hold an old placeholder.
DELETE FROM public.site_settings WHERE key = 'contact_phone_secondary';

UPDATE public.site_settings
SET url = '+251 91 080 9090', updated_at = now()
WHERE key = 'contact_phone_primary'
  AND url IN ('+251 91 123 4567', '+251 91 765 4321', '+251 95 483 4159');

UPDATE public.site_settings
SET url = 'info@sarasolars.com', updated_at = now()
WHERE key = 'contact_email'
  AND url IN ('info@sarapowersolution.com', 'mube@gmail.com', 'mube123@gmail.com');

UPDATE public.site_settings
SET url = 'https://wa.me/251910809090', updated_at = now()
WHERE key = 'contact_whatsapp'
  AND url LIKE 'https://wa.me/%';

UPDATE public.site_settings
SET url = 'Addis Ababa, Bole Road, Dhabi Building, 4th Floor, Office 422', updated_at = now()
WHERE key = 'contact_address'
  AND url = 'Sara Building, Lideta Sub-City, Addis Ababa, Ethiopia';

-- The seeded social profiles point at unverified placeholder accounts. Clear
-- them so the footer does not link out to them; the admin panel can publish
-- the real URLs at any time.
UPDATE public.site_settings
SET url = '', updated_at = now()
WHERE key IN ('social_telegram', 'social_instagram', 'social_tiktok', 'social_linkedin')
  AND url IN (
    'https://t.me/sarapower',
    'https://instagram.com/sarapower',
    'https://tiktok.com/@sarapower',
    'https://linkedin.com/company/sarapower'
  );

-- --------------------------------------------------------------------
-- 11. FIRST ADMIN (run manually after creating the Auth user)
-- --------------------------------------------------------------------
-- Replace the email below with the admin account you created in
-- Supabase Dashboard > Authentication > Users, then run:
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, email
-- FROM auth.users
-- WHERE email = 'admin@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
