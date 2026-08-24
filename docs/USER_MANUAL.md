# Sara Power Solution PLC - Administrator & User Manual

Welcome to the **Sara Power Solution PLC** platform. This platform is split into two primary components: the public-facing **Client Showcase** (which includes the catalog and solar sizing engine) and the **Administrative Dashboard** (where you control all content, branding, and inventory).

This manual provides instructions on how to operate both sides of the platform.

---

## 1. Accessing the Platform

### Public Showcase
The public URL (e.g., `https://sarapowersolutions.com`) directs customers to the main showcase. Here they can view the hero carousel, browse the equipment catalog, and use the solar sizing calculator.

### Administrator Dashboard
To manage the platform, navigate to the `/admin` route (e.g., `https://sarapowersolutions.com/admin`).

**Authentication:**
The admin portal is protected by a session-based passcode. 
- **Current Passcode**: `Sara Power2026` *(Note: Keep this secure. Entering it successfully grants full CRUD (Create, Read, Update, Delete) access to the database).*

---

## 2. Managing Dynamic Branding & Settings

The **Settings Tab** in the Admin Dashboard is your control center for how the brand appears globally across the website. You do not need to edit code to update your brand; changes here reflect instantly.

### Logos & Page Hero Banners
- **Hero Carousel**: The homepage features an auto-advancing cinematic carousel. You have 4 "Slide" slots available (`Slide 1` through `Slide 4`).
  - To add a slide, click **UPLOAD NEW** and select an image from your computer. 
  - To remove a slide, click **REMOVE** (the trash icon). 
  - **Important**: Always click the large **SAVE ASSET** button at the bottom of the card to lock in your changes.
- **Logos**: You can upload distinct logos for Light Mode and Dark Mode to ensure maximum visibility depending on the user's device preferences.

### Company Information & Text
- Update your **Mission Statement** and **Vision Statement** here. 
- Any changes made here are instantly propagated to the "About Us" sections across the frontend.

### Contact Details & Social Media
- Update your **Physical Address**, **Operating Hours**, and **Phone Numbers** (Primary/Secondary).
- Update your **Social Media Links** (Telegram, Instagram, TikTok, LinkedIn). Leaving a URL blank will automatically hide that social icon from the website footer.

---

## 3. Managing Inventory (Products & Categories)

The **Inventory Tab** is where you manage your solar hardware catalog.

### Categories & Sub-Categories
The platform uses a hierarchical category system to keep the public catalog clean and luxurious.
1. **Parent Categories** (e.g., "Solar Panels", "Inverters"): These appear in the left sidebar of the public catalog.
2. **Sub-Categories** (e.g., "Monocrystalline", "Polycrystalline"): These appear as sleek pill-buttons at the top of the catalog when a user clicks on a Parent Category.
- **To create a sub-category**, click "Add New Category" and assign it a "Parent Category" from the dropdown.

### Products
- Click **Add New Product** to open the creation modal.
- **Details**: You can specify custom technical details like Voltage, Capacity, Weight, and Power Output.
- **Stock Status**: You can flag items as `In Stock`, `Low Stock`, `Preorder`, or `Sold Out`. Sold Out items will be visibly greyed out on the public showcase.
- **Featured Toggle**: Enabling the "Featured" star on a product will automatically push it to the rotating display on the homepage.
- **Images**: You can upload multiple images for a single product. 

---

## 4. Managing Engineering Services

The **Services Tab** allows you to list turnkey solutions, installations, or consulting services.
- Services are displayed on the public `/services` page.
- You can add rich descriptions and a list of specific "Scope of Work" bullet points for each service to clearly communicate value to your commercial and residential clients.

---

## 5. The FR-2 Solar Sizing Engine (Calculator)

The public `/calculator` page is an interactive tool designed for your clients.

### How it Works for Clients
- **Mode 1 (Appliance Checklist)**: Clients select standard household appliances, adjust quantities, and set how many hours a day they use them.
- **Mode 2 (Direct kW Input)**: Advanced clients can directly drag sliders for Peak Load ($kW$) and Daily Energy Demand ($kWh$).

### Inquiry Generation
Once the engine calculates the required Inverter size and Battery capacity, clients can click **"Send Inquiry"**. 
- The platform automatically formats their exact load profile and sizing requirements into a professional text message and routes them directly to your company's WhatsApp or Telegram.
- **Printing**: The calculator is highly optimized for printing. If a client prints the page (Ctrl+P / Cmd+P), the system hides the website navigation and branding clutter, generating a clean, professional PDF engineering report featuring your company logo and contact details.

---

## Support
For technical maintenance or updates to the core database schema (Supabase), please refer to the `supabase-schema.sql` documentation or contact the development engineering team.
