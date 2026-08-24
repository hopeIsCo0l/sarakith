# Changelog

All notable changes to the **Sara Power Solution plc Web Platform & Sizing Engine** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
