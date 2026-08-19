# Sara Power Solution plc — Solar Energy Showcase

> **High-Performance Equipment Showcase & Telegram Bot Admin Panel**  
> *Addis Ababa, Ethiopia*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![aiogram](https://img.shields.io/badge/aiogram-3.x-26A69A?style=flat-square&logo=telegram)](https://aiogram.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## Overview

**Sara Power Solution plc Showcase** is a modern, high-density showcase platform and admin management ecosystem engineered for **Sara Power Solution plc** based in **Addis Ababa, Ethiopia**. The platform displays commercial solar power systems, hybrid inverters, and deep cycle energy storage with full technical specifications and direct WhatsApp inquiry integration.

---

## Key Features

- **Solar Energy Inventory**: Tier-1 Monocrystalline Solar Panels, 5.5kW Hybrid Pure Sine Wave Inverters, LiFePO4 Lithium Battery Storage Packs, Gel Deep Cycle Batteries, and 60A MPPT Controllers.
- **Adaptive System Theme**: Supports System Mode, Dark Mode (Obsidian), and Light Mode (Alabaster) with zero flash of unstyled content (FOUC).
- **1-Click WhatsApp Direct Inquiries**: Instant pre-filled spec inquiry links directly to Sara Power Solution's sales desk (+251 95 483 4159).
- **Telegram Admin Bot Panel**: Async Python Telegram Bot ([@sebrtradebot](https://t.me/sebrtradebot)) powered by aiogram 3 and FastAPI for updating stock levels, uploading photos to Supabase Storage, and managing catalog items.
- **Dynamic Filter & Sort Matrix**: Category selection, search query matching, stock availability filters, and range sliders in Ethiopian Birr (ETB).

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

```
.
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── src/
│   │   ├── app/                  # Page routes (HomePage, Catalog, Services, Detail Page)
│   │   ├── components/           # UI Components (Navbar, Footer, ProductCard, QuickViewModal, FilterSidebar)
│   │   ├── context/              # ThemeContext (System, Dark, Light mode provider)
│   │   ├── lib/                  # Constants, Types, Mock Data, Supabase Client
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
├── supabase/
│   └── schema.sql                # PostgreSQL schema & Row Level Security (RLS) policies
└── README.md
```

---

## Quick Start (Local Development)

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Backend & Telegram Bot Setup

```bash
cd backend
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
4. Add environment variables (`BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ADMIN_IDS`).

---

## License

Distributed under the MIT License. Copyright © 2026 **Sara Power Solution plc**. All rights reserved.
