# Sara Power Solution PLC
## Official Administrator & User Manual

Welcome to the **Sara Power Solution PLC** platform. This system is designed as a luxury e-commerce and engineering portal. It features a public-facing **Client Showcase** (which includes the catalog and solar sizing engine) and a secure **Administrative Dashboard** (where you control all content, branding, and inventory).

This manual provides comprehensive instructions on how to operate and maintain every aspect of the platform.

---

## 1. System Overview & Access

### 1.1 The Public Showcase
The public URL (e.g., `https://sarapowersolutions.com`) is your digital storefront. It is optimized for performance, mobile responsiveness, and high-end visual aesthetics (the "Kith-style" theme). 
- **Homepage**: Features the cinematic auto-advancing hero carousel, mission statement, featured products, and quick-access categories.
- **Solar Equipment Catalog**: A structured hierarchical inventory system where users can filter by category, sub-category, stock status, and price.
- **Solar Sizing Engine**: An interactive engineering tool that calculates required inverter and battery sizes based on a client's specific appliance load.
- **Engineering Services**: A dedicated page outlining turnkey solutions, installations, and maintenance packages.

### 1.2 The Administrator Dashboard
To manage the platform, navigate to the `/admin` route (e.g., `https://sarapowersolutions.com/admin`).

**Authentication:**
The admin portal is protected by a session-based secure passcode to prevent unauthorized access.
- **Current Passcode**: `Sara Power2026` 
- *(Note: Entering this successfully grants full CRUD (Create, Read, Update, Delete) access to the underlying Supabase database. Do not share this outside of authorized personnel).*

---

## 2. Dynamic Branding & Settings Management

The **Settings Tab** in the Admin Dashboard is the central nervous system for your brand's digital presence. You do not need to involve developers to update your brand; changes made here reflect instantly across the entire platform.

### 2.1 Logos & Page Hero Banners
- **Cinematic Hero Carousel**: The homepage features a massive, edge-to-edge auto-advancing carousel. You have 4 image slots available (`Slide 1` through `Slide 4`).
  - **Adding an Image**: Click **UPLOAD NEW** and select a high-resolution image from your device.
  - **Removing an Image**: Click **REMOVE** (the trash icon) to clear the slot. The carousel automatically adjusts and will skip empty slots seamlessly.
  - **Important**: You must click the large **SAVE ASSET** button at the bottom of the card to lock your changes into the database.
- **Platform Logos**: You can upload distinct logos for Light Mode and Dark Mode. This ensures maximum visibility regardless of the user's operating system preferences.

### 2.2 Company Information & Core Text
- **Mission & Vision**: Update your "Mission Statement" and "Vision Statement" here. Any changes are instantly propagated to the "About Us" sections across the frontend.
- **Company Title**: Ensure your official registered name (e.g., "Sara Power Solution PLC") is accurately reflected.

### 2.3 Contact Details & Social Media Telemetry
- **Physical Details**: Update your **Address**, **Operating Hours**, and **Phone Numbers** (Primary/Secondary).
- **Social Media Links**: Manage links to Telegram, Instagram, TikTok, and LinkedIn. 
  - *Pro-tip*: Leaving a social URL blank will automatically hide that specific social icon from the website footer, keeping the UI clean.

---

## 3. Inventory Control (Products & Categories)

The **Inventory Tab** is where you manage your solar hardware catalog. The system uses a hierarchical structure to keep the public catalog luxurious and organized.

### 3.1 Managing Categories
1. **Parent Categories** (e.g., "Solar Panels", "Inverters"): These are top-level classifications that appear in the left sidebar of the public catalog.
2. **Sub-Categories** (e.g., "Monocrystalline", "Polycrystalline"): These appear as sleek, clickable pill-buttons at the top of the catalog when a user selects a Parent Category.
- **Creating a Sub-category**: Click "Add New Category", fill in the details, and assign it a "Parent Category" from the dropdown list.

### 3.2 Managing Products
- **Creation**: Click **Add New Product** to open the creation modal.
- **Technical Specifications**: You can specify exact engineering details like Voltage, Capacity, Weight, Power Output, and Warranty.
- **Stock Status Control**: You can flag items as `In Stock`, `Low Stock`, `Preorder`, or `Sold Out`. Sold Out items will be visibly greyed out and labeled on the public showcase.
- **Featured Showcase**: Enabling the "Featured" star on a product will automatically push it to the rotating "Featured Drops" display on the homepage.
- **Media Management**: You can upload multiple high-resolution images for a single product. The system handles automatic background storage and CDN delivery.

---

## 4. Managing Engineering Services

The **Services Tab** allows you to list turnkey solutions, commercial installations, or consulting services.
- **Display**: These services are displayed as premium cards on the public `/services` page.
- **Details**: You can add rich descriptions, base pricing, and a specific "Scope of Work" checklist for each service to clearly communicate value to your commercial and residential clients.

---

## 5. The FR-2 Solar Sizing Engine

The public `/calculator` page is a flagship interactive tool designed to capture high-value engineering leads.

### 5.1 How Clients Use It
- **Mode 1 (Appliance Checklist)**: Clients select standard household appliances, adjust quantities, and set their estimated daily runtime hours.
- **Mode 2 (Direct kW Input)**: Advanced clients (or your internal engineers) can directly drag sliders for Peak Load ($kW$) and Daily Energy Demand ($kWh$).

### 5.2 Intelligent Output & Lead Generation
The engine mathematically calculates the required Inverter size ($kVA$) and Battery capacity ($kWh$), applying standard efficiency losses and depth-of-discharge margins.
- **System Tiers**: It recommends 3 matched system packages (Essential Backup, Full Household Hybrid Kit, Heavy-Duty Master Kit).
- **One-Click Inquiry**: Clients can click **"Send Inquiry"**. The platform automatically formats their exact load profile and sizing requirements into a professional text message and routes them directly to your company's WhatsApp or Telegram.

### 5.3 Professional PDF Reporting
The calculator is highly optimized for offline engineering reports.
- If a client or staff member prints the page (Ctrl+P / Cmd+P), the system aggressively hides website navigation, sidebars, and branding clutter. 
- It generates a clean, professional, white-label PDF engineering report featuring your company logo and the calculated specifications, perfect for attaching to formal quotes.

---

## 6. Technical Support & Maintenance
The platform is built on Next.js 14, React, Tailwind CSS, and powered by a Supabase PostgreSQL backend.
- For technical maintenance, database migrations, or updates to the core schema, please refer to the `supabase-schema.sql` documentation or contact your development engineering team.
