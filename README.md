# Sara Power Solution plc — Solar Energy Showcase

> **High-Performance Equipment Showcase, Solar Calculator & Admin Panel**  
> *Addis Ababa, Ethiopia*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![aiogram](https://img.shields.io/badge/aiogram-3.x-26A69A?style=flat-square&logo=telegram)](https://aiogram.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## Overview

**Sara Power Solution plc Showcase** is a modern, high-density showcase platform and admin management ecosystem engineered for **Sara Power Solution plc** based in **Addis Ababa, Ethiopia**. The platform displays commercial solar power systems, hybrid inverters, and deep cycle energy storage with full technical specifications, an advanced solar sizing calculator, and direct WhatsApp inquiry integration. It features a premium "Kith-style" cinematic UI redesign.

---

## Key Features

- **Advanced Product Showcase**: Tier-1 Monocrystalline Solar Panels, Hybrid Pure Sine Wave Inverters, LiFePO4 Lithium Battery Storage Packs, Gel Deep Cycle Batteries, and MPPT Controllers. High-res imagery with Quick-View modals and hierarchical category routing.
- **Dynamic Admin Control Panel**: Comprehensive authenticated dashboard for full CRUD operations on Products, Categories, Sub-Categories, and global Site Settings (Hero banners, social links, About Us text).
- **Automated Solar Power Sizing Calculator**: Interactive appliance modeling and direct kW power input with real-time telemetry dials. Matches household power load to recommended items and matched system packages.
- **Dynamic Specifications Matrix**: Admins can build fully custom, arbitrary technical attribute matrices for each equipment item.
- **Adaptive System Theme**: Supports System Mode, Dark Mode (Obsidian), and Light Mode (Alabaster) with zero flash of unstyled content (FOUC).
- **1-Click WhatsApp Direct Inquiries**: Instant pre-filled spec inquiry links directly to Sara Power Solution's sales desk (+251 95 483 4159).
- **Telegram Admin Bot Panel**: Async Python Telegram Bot ([@sebrtradebot](https://t.me/sebrtradebot)) powered by aiogram 3 and FastAPI for updating stock levels, uploading photos to Supabase Storage, and managing catalog items.
- **Real-time UI Synchronization**: Built with Supabase Realtime WebSockets to update inventory and site settings on active customer browsers instantly.

---

## Company Profile & Contact

| Detail | Information |
| :--- | :--- |
| **Legal Company Name** | **Sara Power Solution plc** |
| **Physical Address** | Addis Ababa, Bole Road, Dhabi Building, 4th Floor, Office 422 |
| **WhatsApp / Phone** | `+251 95 483 4159` |
| **Primary Email** | `mube@gmail.com` \| `mube123@gmail.com` |
| **Business Hours** | Mon - Sat: 8:30 AM - 6:00 PM |
| **Google Maps** | [Location Link](https://maps.app.goo.gl/CFdZ3HqwP3SCszAd7) |
| **Telegram Bot** | [@sebrtradebot](https://t.me/sebrtradebot) |

---

## Repository Structure

```text
.
├── frontend/                     # Next.js 16 App Router Frontend (React 19, Node 22+)
│   ├── src/
│   │   ├── app/                  # Page routes (HomePage, Catalog, Calculator, Admin, About, Services)
│   │   ├── components/           # UI Components (Navbar, Footer, ProductCard, QuickViewModal, FilterSidebar)
│   │   ├── context/              # ThemeContext (System, Dark, Light mode provider)
│   │   ├── lib/                  # Constants, Types, Mock Data, Supabase Client
│   │   │   └── server/           # Server-only data layer (cached queries) and SEO helpers
│   │   └── styles/               # Semantic design system CSS tokens (globals.css)
│   └── tailwind.config.js
│
├── backend/                      # Python Async FastAPI & Telegram Bot Backend
│   ├── bot/                      # aiogram 3 bot handlers, keyboards, middlewares & states
│   ├── db/                       # Supabase client wrapper & database methods
│   ├── config.py                 # Pydantic environment configuration
│   ├── main.py                   # FastAPI server entry point with bot polling task
│   └── seed_db.py                # Database population script
│
├── supabase-schema.sql           # PostgreSQL schema & Row Level Security (RLS) policies
├── supabase/migrations/          # Versioned, append-only database migrations
├── docs/                         # Project Specifications (SRS, Proposals, SECURITY.md)
├── CHANGELOG.md                  # Project versions and new features
└── README.md
```

---

## Quick Start (Local Development)

### 1. Frontend Setup

Requires **Node.js 22+** (see `frontend/.nvmrc`).

```bash
cd frontend
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# Add NEXT_PUBLIC_SITE_URL (canonical origin, no trailing slash)
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Before the admin panel can write data, apply the security migration and create an admin user:
see [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Rendering, Caching & SEO

The public site is **server rendered and statically regenerated**:

- **Server components** fetch catalog data on the server through
  `frontend/src/lib/server/data.ts`. Interactive pieces (hero carousel, catalog
  filters, product gallery, quick view) stay as small client islands.
- **ISR** — every public page is prerendered and refreshed in the background
  every 5 minutes; product pages are additionally prerendered per slug.
- **On-demand revalidation** — saving a product, category, service, or site
  setting in `/admin` calls `POST /api/revalidate` with the admin's access
  token, so the public pages update immediately instead of waiting for the
  background refresh. The endpoint verifies the session and the admin
  allowlist before dropping any cache entry.
- **Metadata** — every route exports its own title, description, canonical URL,
  Open Graph and Twitter tags. `NEXT_PUBLIC_SITE_URL` is required for absolute
  URLs; without it the site still renders, but canonical tags and the sitemap
  are omitted rather than pointing at a guessed domain.
- **Structured data** — `LocalBusiness` (site-wide), `Product` and
  `BreadcrumbList` (product pages) and `FAQPage` (calculator).
- **Discovery** — `sitemap.xml` is generated from the live catalog, and
  `robots.txt` blocks `/admin` and `/api/`.
- **Resilience** — `loading.tsx`, `error.tsx` and `not-found.tsx` give every
  route a skeleton, a retry screen, and a 404 page.

### 2. Backend & Telegram Bot Setup

```bash
cd backend
cp .env.example .env
# Fill BOT_TOKEN, ALLOWED_ADMIN_IDS, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend API will run on [http://localhost:8000](http://localhost:8000).

---

## 1-Click Deployment Guide

### Host Frontend on Vercel
1. Push repository to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

### Host Backend on Render / Railway
1. Create a Web Service on [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables (`BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ADMIN_IDS`, `FRONTEND_URL`).

---

## License

Distributed under the MIT License. Copyright © 2026 **Sara Power Solution plc**. All rights reserved.

---

**Developed by [HopeLabs](https://www.linkedin.com/in/abdellah-fita)**
