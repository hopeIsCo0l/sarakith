# Sara Power Solution plc — Solar Energy Showcase

> **High-Performance Equipment Showcase, Solar Calculator & Admin Panel**  
> *Addis Ababa, Ethiopia*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## Overview

**Sara Power Solution plc Showcase** is a modern, high-density showcase platform and admin management ecosystem engineered for **Sara Power Solution plc** based in **Addis Ababa, Ethiopia**. The platform displays commercial solar power systems, hybrid inverters, and deep cycle energy storage with full technical specifications, an advanced solar sizing calculator, and direct WhatsApp inquiry integration. It features a premium cinematic UI with a glassmorphic design language.

---

## Key Features

- **Advanced Product Showcase**: Tier-1 Monocrystalline Solar Panels, Hybrid Pure Sine Wave Inverters, LiFePO4 Lithium Battery Storage Packs, Gel Deep Cycle Batteries, and MPPT Controllers. High-res imagery with Quick-View modals and hierarchical category routing.
- **Dynamic Admin Control Panel**: Comprehensive authenticated dashboard for full CRUD operations on Products, Categories, Sub-Categories, and global Site Settings (Hero banners, social links, About Us text).
- **Automated Solar Power Sizing Calculator**: Interactive appliance modeling and direct kW power input with real-time telemetry dials. Matches household power load to recommended items and matched system packages.
- **Dynamic Specifications Matrix**: Admins can build fully custom, arbitrary technical attribute matrices for each equipment item.
- **Adaptive System Theme**: Supports System Mode, Dark Mode (Obsidian), and Light Mode (Alabaster) with zero flash of unstyled content (FOUC).
- **1-Click WhatsApp Direct Inquiries**: Instant pre-filled spec inquiry links directly to Sara Power Solution's sales desk (+251 91 080 9090).
- **Real-time UI Synchronization**: Built with Supabase Realtime WebSockets to update inventory and site settings on active customer browsers instantly.

---

## Company Profile & Contact

| Detail | Information |
| :--- | :--- |
| **Legal Company Name** | **Sara Power Solution plc** |
| **Physical Address** | Addis Ababa, Bole Road, Dhabi Building, 4th Floor, Office 422 |
| **WhatsApp / Phone** | `+251 91 080 9090` |
| **Primary Email** | `info@sarasolars.com` |
| **Website** | [sarasolars.com](https://sarasolars.com) |
| **Business Hours** | Mon - Sat: 8:30 AM - 6:00 PM |
| **Google Maps** | [Location Link](https://maps.app.goo.gl/CFdZ3HqwP3SCszAd7) |

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
├── backend/                      # Python FastAPI status service
│   ├── db/                       # Supabase client wrapper & database methods
│   ├── config.py                 # Pydantic environment configuration
│   ├── main.py                   # FastAPI server entry point
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
  Open Graph and Twitter tags. `NEXT_PUBLIC_SITE_URL` sets the canonical
  origin and falls back to `https://sarasolars.com`.
- **Structured data** — `LocalBusiness` (site-wide), `Product` and
  `BreadcrumbList` (product pages) and `FAQPage` (calculator).
- **Discovery** — `sitemap.xml` is generated from the live catalog, and
  `robots.txt` blocks `/admin` and `/api/`.
- **Resilience** — `loading.tsx`, `error.tsx` and `not-found.tsx` give every
  route a skeleton, a retry screen, and a 404 page.

### 2. Status Service Setup

The catalog is served entirely by the Next.js frontend. The backend is an
optional health/statistics service; the site does not depend on it.

```bash
cd backend
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and FRONTEND_URL
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

The service runs on [http://localhost:8000](http://localhost:8000) and exposes
`/` and `/api/health`.

---

## 1-Click Deployment Guide

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend` — the repo root also contains a
   `package.json`, so a wrong root builds to the wrong output directory.
4. Set **Node.js Version** to **22.x** (Next.js 16 does not run on Node 20).
5. Add environment variables for **Production**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — canonical origin, defaults to
     `https://sarasolars.com` when unset
6. Add the domain under **Settings → Domains** and point the DNS A/CNAME
   record at Vercel. `sarasolars.com` also needs MX/SPF/DKIM records for the
   `info@sarasolars.com` mailbox.
7. Click **Deploy**. Redeploy after changing any `NEXT_PUBLIC_*` variable —
   they are inlined at build time.

### Status Service (Render / Railway) — optional
1. Create a Web Service on [Render](https://render.com) using the
   `render.yaml` blueprint, or set the **Root Directory** to `backend`.
2. Set **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `FRONTEND_URL`).

---

## License

Distributed under the MIT License. Copyright © 2026 **Sara Power Solution plc**. All rights reserved.

---

**Developed by [HopeLabs](https://www.linkedin.com/in/abdellah-fita)**
