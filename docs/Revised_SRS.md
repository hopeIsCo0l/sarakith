# HOPE LABS
## Software Requirements (SRS) & Design Specification (SDS) - REVISED EDITION

**System:** Sara Power Solutions Web Platform
**Author:** Hope Labs Engineering
**Domain:** sarapower.et
**Stack:** Next.js + Vercel + Supabase DB

---

## PART 1: SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

### 1. System Overview & User Roles
The system is a full-stack, highly dynamic solar product catalog showcase and automated household solar calculator. It has been significantly expanded from the initial scope to include a robust Content Management System (CMS) and hierarchical product structures. It supports two primary user classes:

- **Public Customer:** Browses products, utilizes advanced multi-faceted filtering (price, category, sub-category), inputs household Kilowatt (kW) power requirements, toggles visual themes, and initiates inquiries via WhatsApp/Telegram.
- **System Admin:** Authenticated administrator managing products, hierarchical categories, technical solar attributes, live site settings (Hero banners, social links), and real-time database synchronization.

### 2. Functional Requirements (FR)
*(Includes Original + Scope Expansion Features)*

- **FR-1 Advanced Product Showcase [EXPANDED]:** High-res imagery display with Quick-View modals. Complex client-side filtering engine supporting price range sliders, sub-category routing, and real-time stock status.
- **FR-2 Solar Calculator (kW Input):** Customer inputs household power load in Kilowatts (kW). System matches Supabase attributes (Inverter kVA, Battery storage kWh, Panel Wp) and displays recommended items/kits.
- **FR-3 Dynamic Admin Control Panel [NEW]:** Comprehensive authenticated dashboard. Admins can perform full CRUD (Create, Read, Update, Delete) operations on Products, Categories, Sub-Categories, and global Site Settings.
- **FR-4 Hierarchical Categories [NEW]:** Database and UI support for parent-child category relationships, allowing for complex inventory routing.
- **FR-5 Inquiry Routing:** Direct click-to-contact buttons (WhatsApp, Telegram, Phone) pre-populated with specific item details and technical specifications.
- **FR-6 Real-time UI Synchronization [NEW]:** Implementation of Supabase Realtime WebSockets. When admins update inventory or site settings, active customer browsers update instantly without reloading.
- **FR-7 Dynamic Specifications Matrix [NEW]:** Allows admins to build fully custom, arbitrary technical attribute matrices (e.g., cell efficiency, inverter voltage) for each equipment item, which seamlessly hydrate into the frontend UI.
- **FR-8 Integrated About Us / Mission CMS [NEW]:** Centralized management of the Corporate Overview and Mission Statement text blocks directly from the Admin Dashboard, which instantly pushes updates to the `/about` public routing.

### 3. Non-Functional Requirements (NFR)
- **NFR-1 Performance:** Edge-cached Server-Side Rendering (SSR) via Next.js for sub-second page loads.
- **NFR-2 Security:** SSL (HTTPS) encryption, Supabase Row Level Security (RLS), and JWT authenticated admin routes.
- **NFR-3 Availability:** 99.9% uptime target via Vercel Edge Network.
- **NFR-4 UX/Design [EXPANDED]:** Implementation of a premium, "cinematic" design language (Kith-inspired), including a custom dark/light theme engine, glassmorphism overlays, and fluid micro-animations.

---

## PART 2: SOFTWARE DESIGN SPECIFICATION (SDS)

### 1. System Architecture
**3-Tier Serverless Architecture:** Next.js Frontend (Vercel) + Application Logic (Server Components & Next.js Cache) + Managed Database (Supabase PostgreSQL with Realtime enabled).

### 2. Database Schema (Expanded Supabase PostgreSQL)
*(Added sub-category and site settings relations)*

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- NEW
    image_url TEXT,
    display_order INTEGER DEFAULT 0
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price_etb NUMERIC(12, 2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    sub_category_id UUID REFERENCES categories(id), -- NEW
    in_stock BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE -- NEW
);

-- Site settings for dynamic Hero Banners and Social Links
CREATE TABLE site_settings (
    key VARCHAR(255) PRIMARY KEY,
    url TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Deployment Architecture
- **Domain delegation:** Ethio Telecom domain (`sarapower.et`) CNAME/A-record pointing to Vercel edge IP.
- **Zero-downtime CI/CD:** Automated git push deployments via GitHub integration.
