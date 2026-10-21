# Changelog

All notable changes to the **Sara Power Solution plc Web Platform & Sizing Engine** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.7.0] - 2026-10-21

### Added
- **Server rendering & ISR** — home, catalog, product, services, about and calculator pages now render on the server and are statically regenerated every 5 minutes; product pages are prerendered per slug.
- **On-demand revalidation** — `POST /api/revalidate` lets administrators refresh cached pages immediately after a catalog edit; the endpoint verifies the admin session and the `admin_users` allowlist.
- **SEO surface** — per-route metadata, canonical URLs, Open Graph/Twitter tags, dynamic `sitemap.xml`, `robots.txt`, and `LocalBusiness`, `Product`, `BreadcrumbList` and `FAQPage` structured data.
- **Route resilience** — `loading.tsx`, `error.tsx` and `not-found.tsx` skeletons and retry screens.
- **Catalog deep links** — `/catalog?category=slug` now applies the category filter.

### Changed
- Catalog, product, services, about and calculator pages converted to server components with focused client islands (hero carousel, filters, gallery, quick view).
- Server-only data layer in `frontend/src/lib/server/data.ts` with tagged caching; site settings are now rendered on the server and handed to the client provider.
- `NEXT_PUBLIC_SITE_URL` drives canonical URLs, Open Graph tags and the sitemap.
- **Contact details consolidated** — the company now publishes a single phone number, `+251 91 080 9090`, on every page, in the WhatsApp payload, in the printed calculator report and in the structured data.
- **Legacy clothing-brand copy removed** from the Telegram bot, the backend fallbacks and the product cards; catalog search now covers specification fields and product cards show the manufacturer.
- **Unused assets removed** — 3.2 MB of orphaned images, five unused font weights, the font archive and a LibreOffice lock file.

---

## [1.6.0] - 2026-10-19

### Security
- Replaced the hardcoded admin passcode with **Supabase Auth** email/password login.
- Added an `admin_users` allowlist and `is_admin()` helper.
- Replaced permissive `WITH CHECK (true)` write policies with admin-only RLS policies.
- Restricted public product reads to `is_visible = true`.
- Locked storage uploads/updates/deletes to authenticated admins.
- Removed the base64 image-upload fallback; images now require Supabase Storage.
- Restricted FastAPI CORS to configured frontend origins.
- Made the Telegram bot fail closed when `ALLOWED_ADMIN_IDS` is empty.

### Changed
- Upgraded to **Next.js 16.4.2** and **React 19.3.1**.
- Updated the product detail route for Next.js async route params.
- Restricted `next/image` remote patterns to the configured Supabase project.
- Added `frontend/.env.example`, Node 22 engine requirements, and `docs/SECURITY.md`.

---

## [1.5.0] - 2026-08-23

### Added
- **Dynamic Branding Manager (`/admin`)**:
  - Real-time management of up to 4 homepage hero banners directly from the Settings tab.
  - Ability to seamlessly update company logos, mission statements, social media links (Telegram, Instagram, TikTok, LinkedIn), and contact telemetry without redeploying.
- **Cinematic Hero Carousel**:
  - Upgraded the homepage hero section to a 4-slide, edge-to-edge auto-advancing carousel with CSS cross-fading.
  - Included sleek frosted-glass manual navigation controls and slide counters.
- **Luxury Category Drill-down (`/catalog`)**:
  - Introduced a dynamic Category Header Block that displays category descriptions and titles.
  - Added interactive sub-category filter pill-buttons for a premium e-commerce browsing experience.

### Changed
- **"Kith-style" UI Redesign**: Transitioned the entire frontend to a premium, minimalist aesthetic featuring high-contrast typography, edge-to-edge layouts, and "liquid glass" navigation bars.
- **Print Optimization**: Implemented aggressive CSS print rules (`print:hidden`) on the Solar Calculator page to ensure clean, professional, and branded PDF report generation.

---

## [1.4.0] - 2026-08-07

### Added
- **Full Admin CRUD Operations (`/admin`)**:
  - Full modal-based **Create**, **Read**, **Update**, and **Delete** for Products, Categories, and Services.
  - Multi-image file upload support with automatic Base64 Data URL fallback for uninterrupted operation.
  - Quick inline toggle buttons for stock status (`in_stock` / `sold_out`) and featured showcase status.
- **Supabase Backend Schema (`supabase/schema.sql`)**:
  - PostgreSQL schema with Row Level Security (RLS), indexes, and foreign key cascades.
  - Dedicated `solar_attributes` table for power sizing parameters ($W_p$, $kVA$, $kWh$).

---

## [1.3.0] - 2026-08-07

### Added
- **FR-2 Automated Solar Power Sizing Calculator (`/calculator`)**:
  - **Mode 1 (Appliance Checklist)**: Interactive appliance modeling with customizable duty cycles (Refrigerator, TV, Water Pump, Washing Machine, LED Bulbs, Fans, Custom items).
  - **Mode 2 (Direct kW Power Input)**: Continuous peak load slider ($0.5\text{ kW} - 15.0\text{ kW}$), daily energy demand ($kWh/\text{day}$), and battery autonomy selector ($6\text{h} - 24\text{h}$).
  - Real-time telemetry dials for Peak Continuous Load ($kW$), Daily Units ($kWh$), Required Inverter ($kVA$), and Lithium $\text{LiFePO}_4$ Storage ($kWh$).
  - 3-Tier matched system packages (Essential Backup, Full Household Hybrid Kit, Heavy-Duty Master Kit).
  - One-click pre-populated WhatsApp & Telegram inquiry routing with exact calculated power specifications.
  - Ethiopian irradiance math calibrated at $5.2\text{ Peak Sun Hours (PSH)}$.

---

## [1.2.0] - 2026-08-06

### Added
- **Administrative Portal (`/admin`)**:
  - Session-based passcode authentication (`Sara Power2026`).
  - Inventory metrics counter bar (Total products, categories, in-stock count, active services).
  - Search and filter by category and SKU.
  - Multi-photo gallery thumbnail previews.

---

## [1.1.0] - 2026-08-05

### Added
- **FastAPI Telegram Assistant Bot (`backend/`)**:
  - AI customer service instance with automatic inventory querying and price lookups.
  - Webhook integration and deployment configurations for Render cloud hosting.
  - Python seed database script (`backend/seed_db.py`).

---

## [1.0.0] - 2026-08-04

### Added
- **Next.js 14 Web Showcase (`frontend/`)**:
  - Mobile-first responsive showcase catalog for solar equipment & commercial audio.
  - Category filters, price sorting, and instant Quick View modal overlays.
  - WhatsApp, Telegram, Google Maps, and physical office contact points in Addis Ababa, Ethiopia.
