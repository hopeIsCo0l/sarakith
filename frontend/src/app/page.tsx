'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sun, ShieldCheck, Zap, Sparkles, Terminal, Activity, CheckCircle, Building2, Award, Users } from 'lucide-react';
import { getProducts, supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/components/ProductGrid';
import { QuickViewModal } from '@/components/QuickViewModal';
import { HERO_HEADER, BRAND_TAGLINE } from '@/lib/constants';
import heroBannerImg from '@/ass/HeroBanner.png';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function HomePage() {
  const { getSettingUrl } = useSiteSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts({ isFeatured: true });
      setFeaturedProducts(data);
    }
    loadData();

    // 1. Instant re-fetch on window focus
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);

    // 2. Cross-tab & intra-window broadcast sync
    const broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sara_power_sync') : null;
    if (broadcast) {
      broadcast.onmessage = () => loadData();
    }
    window.addEventListener('sara_data_updated', loadData);

    // 3. Live Supabase Realtime Postgres Changes Subscription
    let channel: any;
    if (supabase) {
      channel = supabase
        .channel('realtime_home_products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          loadData();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('sara_data_updated', loadData);
      if (broadcast) broadcast.close();
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-20 pb-24 transition-colors">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-kith-bg border-b border-sara-red/25">
        {/* Tech Grid Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(111,15,16,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(111,15,16,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-sara-red/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute left-0 bottom-1/4 w-96 h-96 bg-sara-red/8 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-8 py-16 lg:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-8">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-sara-red/50 bg-sara-red/10 text-[10px] sm:text-xs font-mono font-bold tracking-superwide uppercase text-sara-red dark:text-red-400 shadow-[0_0_15px_rgba(111,15,16,0.2)] rounded-sm">
                <Terminal className="w-3.5 h-3.5" />
                SARA POWER SOLUTION PLC // TIER-1 SYSTEMS
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-kith-bone uppercase leading-[1.08] font-mono">
                {HERO_HEADER}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm font-mono text-kith-muted leading-relaxed max-w-2xl border-l-2 border-sara-red/60 pl-4">
                {BRAND_TAGLINE}. Discover high-efficiency monocrystalline solar panels, hybrid pure sine wave inverters, and LiFePO4 lithium batteries engineered for lasting performance across Ethiopia.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/catalog"
                  className="px-8 py-4 bg-sara-red text-white hover:bg-sara-redLight border border-sara-red/60 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(111,15,16,0.35)] hover:shadow-[0_0_30px_rgba(111,15,16,0.55)] transition-all flex items-center gap-2 rounded-sm"
                >
                  EXPLORE EQUIPMENT
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/calculator"
                  className="px-8 py-4 bg-sara-red/10 text-sara-red dark:text-red-400 border border-sara-red/40 hover:bg-sara-red/20 hover:border-sara-red/70 text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-sm"
                >
                  <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                  LOAD CALCULATOR
                </Link>
              </div>

              {/* Telemetry Feature Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-sara-red/20 max-w-lg">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-sara-red dark:text-red-400 font-bold uppercase">550W+ TOPCon</div>
                  <div className="text-[11px] font-mono text-kith-muted">Tier-1 Monocrystalline</div>
                </div>
                <div className="space-y-1 border-l border-sara-red/20 pl-4">
                  <div className="text-[10px] font-mono text-sara-red dark:text-red-400 font-bold uppercase">48V / 5.5kW - 11kW</div>
                  <div className="text-[11px] font-mono text-kith-muted">Pure Sine Inverters</div>
                </div>
                <div className="space-y-1 border-l border-sara-red/20 pl-4">
                  <div className="text-[10px] font-mono text-sara-red dark:text-red-400 font-bold uppercase">6,000+ Cycles</div>
                  <div className="text-[11px] font-mono text-kith-muted">LiFePO4 Storage</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Banner Image Presentation */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {/* Glowing Background aura */}
              <div className="absolute inset-0 -m-4 bg-sara-red/15 blur-2xl rounded-2xl pointer-events-none -z-10" />

              {/* Hero Image Card */}
              <div className="relative w-full rounded-sm overflow-hidden border border-sara-red/40 bg-kith-card shadow-[0_15px_40px_rgba(111,15,16,0.18)] group transition-all">
                {/* Tech Corner Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sara-red z-20 pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sara-red z-20 pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sara-red z-20 pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sara-red z-20 pointer-events-none"></div>

                {/* Status Indicator Tag */}
                <div className="absolute top-4 left-4 z-20 bg-kith-bg/90 backdrop-blur-md px-3 py-1 border border-sara-red/40 flex items-center gap-2 rounded-sm shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-kith-bone uppercase">
                    OFFICIAL HARDWARE SHOWCASE
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  <img
                    src={getSettingUrl('hero_banner', heroBannerImg.src)}
                    alt="Sara Power Solution Systems Hardware Banner"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-kith-bg/90 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom Banner Meta Bar */}
                <div className="p-4 bg-kith-subBg/90 border-t border-sara-red/25 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-kith-bone uppercase tracking-wider">
                      Sara Power Energy Systems
                    </span>
                    <span className="text-[10px] font-mono text-sara-red dark:text-red-400">
                      Tier-1 Inverters, Lithium Storage & Arrays
                    </span>
                  </div>
                  <Link
                    href="/catalog"
                    className="px-3 py-1.5 bg-sara-red/15 hover:bg-sara-red text-sara-red dark:text-red-300 hover:text-white border border-sara-red/40 text-[10px] font-mono font-bold tracking-widest uppercase transition-all rounded-sm"
                  >
                    VIEW SPECS →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Equipment Grid Section */}
      <section id="featured" className="max-w-[1700px] mx-auto px-4 sm:px-8 space-y-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-sara-red/30 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase block mb-2 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> HARDWARE_INVENTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-kith-bone uppercase">
              Premium Solar Equipment
            </h2>
          </div>

          <Link
            href="/catalog"
            className="text-[10px] font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 hover:text-white flex items-center gap-1 transition-colors bg-sara-red/10 hover:bg-sara-red px-4 py-2 border border-sara-red/40 rounded-sm uppercase"
          >
            EXECUTE_FULL_CATALOG_QUERY →
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          onQuickView={(p) => setSelectedQuickView(p)}
        />
      </section>

      {/* Capabilities Showcase */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="tech-panel p-10 space-y-4 group rounded-sm border border-sara-red/30">
            <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-6 group-hover:bg-sara-red/20 transition-colors shadow-sm">
              <Sun className="w-6 h-6 text-sara-red dark:text-red-400" />
            </div>
            <h3 className="text-lg font-black font-mono text-kith-bone uppercase tracking-widest">
              Complete Solar Solutions
            </h3>
            <p className="text-xs font-mono text-kith-muted leading-relaxed">
              Tier-1 monocrystalline panels, hybrid pure sine wave inverters, MPPT controllers, and long-life lithium battery storage systems designed for Ethiopian conditions.
            </p>
          </div>

          <div className="tech-panel p-10 space-y-4 group rounded-sm border border-sara-red/30">
            <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-6 group-hover:bg-sara-red/20 transition-colors shadow-sm">
              <ShieldCheck className="w-6 h-6 text-sara-red dark:text-red-400" />
            </div>
            <h3 className="text-lg font-black font-mono text-kith-bone uppercase tracking-widest">
              Verified Technical Specs
            </h3>
            <p className="text-xs font-mono text-kith-muted leading-relaxed">
              Detailed voltage rating, frequency response, wattage output, and dimensional specifications rigorously verified for every single catalog item.
            </p>
          </div>
        </div>
      </section>

      {/* FR-2 Solar Sizing Calculator Feature Section */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="p-8 sm:p-14 tech-panel flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative overflow-hidden rounded-sm border border-sara-red/30">
          
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-sara-red/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="space-y-6 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sara-red/10 text-sara-red dark:text-red-400 text-[10px] font-mono font-bold tracking-superwide uppercase border border-sara-red/30 rounded-sm">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Automated Sizing Engine
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-kith-bone uppercase leading-tight">
              CALCULATE YOUR HOUSEHOLD SOLAR POWER INSTANTLY
            </h2>
            <p className="text-xs font-mono text-kith-muted leading-relaxed border-l-2 border-sara-red/50 pl-4">
              Not sure which inverter or battery capacity you need? Select your household appliances (refrigerator, pump, TV, lights) or input your peak Kilowatts (kW) to get an automated sizing calculation with matching inventory kits.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/calculator"
                className="px-8 py-4 bg-sara-red text-white hover:bg-sara-redLight border border-sara-red/60 text-xs font-mono font-bold tracking-widest uppercase transition-all flex items-center gap-2 rounded-sm shadow-[0_0_20px_rgba(111,15,16,0.35)]"
              >
                <Sun className="w-4 h-4" />
                <span>INITIATE_CALCULATOR_PROTOCOL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-[450px] relative z-10">
            <div className="p-5 bg-kith-subBg/60 border border-sara-red/20 space-y-1.5 hover:border-sara-red/50 transition-colors rounded-sm">
              <div className="text-[9px] font-mono font-bold text-sara-red dark:text-red-400 tracking-widest uppercase">Input Modes</div>
              <div className="text-sm font-black font-mono text-kith-bone uppercase">Appliance / kW</div>
              <div className="text-[10px] font-mono text-kith-muted">Real-time load math</div>
            </div>
            <div className="p-5 bg-kith-subBg/60 border border-sara-red/20 space-y-1.5 hover:border-sara-red/50 transition-colors rounded-sm">
              <div className="text-[9px] font-mono font-bold text-sara-red dark:text-red-400 tracking-widest uppercase">Storage</div>
              <div className="text-sm font-black font-mono text-kith-bone uppercase">LiFePO4 Sizing</div>
              <div className="text-[10px] font-mono text-kith-muted">Night backup autonomy</div>
            </div>
            <div className="p-5 bg-kith-subBg/60 border border-sara-red/20 space-y-1.5 hover:border-sara-red/50 transition-colors rounded-sm">
              <div className="text-[9px] font-mono font-bold text-sara-red dark:text-red-400 tracking-widest uppercase">PV Array</div>
              <div className="text-sm font-black font-mono text-kith-bone uppercase">Tier-1 550W</div>
              <div className="text-[10px] font-mono text-kith-muted">Ethiopia peak sun hours</div>
            </div>
            <div className="p-5 bg-kith-subBg/60 border border-sara-red/20 space-y-1.5 hover:border-sara-red/50 transition-colors rounded-sm">
              <div className="text-[9px] font-mono font-bold text-sara-red dark:text-red-400 tracking-widest uppercase">Direct Inquiry</div>
              <div className="text-sm font-black font-mono text-kith-bone uppercase">WhatsApp Output</div>
              <div className="text-[10px] font-mono text-kith-muted">Pre-populated payloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Showcase Section */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="tech-panel p-8 sm:p-12 border border-sara-red/30 rounded-sm bg-kith-card space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-sara-red/25 pb-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 text-[10px] font-mono font-bold tracking-superwide uppercase rounded-sm">
                <Building2 className="w-3.5 h-3.5" />
                ABOUT SARA POWER SOLUTION // ADDIS ABABA, ETHIOPIA
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-kith-bone uppercase">
                ENGINEERING EXCELLENCE & TIER-1 SOLAR SYSTEMS
              </h2>
              <p className="text-xs font-mono text-kith-muted leading-relaxed border-l-2 border-sara-red/50 pl-4">
                Sara Power Solution PLC is Ethiopia's premier distributor and systems contractor for high-efficiency monocrystalline solar panels, pure sine wave hybrid inverters, and high-voltage LiFePO4 battery storage systems.
              </p>
            </div>
            <Link
              href="/about"
              className="px-6 py-3.5 bg-sara-red text-white hover:bg-sara-redLight border border-sara-red/60 text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-sm self-start lg:self-center shadow-md"
            >
              <span>LEARN MORE ABOUT US</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-kith-subBg/60 border border-sara-red/20 space-y-2 rounded-sm hover:border-sara-red/40 transition-colors">
              <div className="w-10 h-10 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-sara-red dark:text-red-400" />
              </div>
              <h3 className="text-sm font-bold font-mono text-kith-bone uppercase">Factory Direct Tier-1</h3>
              <p className="text-xs font-mono text-kith-muted leading-relaxed">
                Directly partnered with global Tier-1 leaders for genuine, high-efficiency equipment with full manufacturer warranties.
              </p>
            </div>

            <div className="p-6 bg-kith-subBg/60 border border-sara-red/20 space-y-2 rounded-sm hover:border-sara-red/40 transition-colors">
              <div className="w-10 h-10 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-sara-red dark:text-red-400" />
              </div>
              <h3 className="text-sm font-bold font-mono text-kith-bone uppercase">Local 5-Year Warranty</h3>
              <p className="text-xs font-mono text-kith-muted leading-relaxed">
                No international shipping delays. Local hardware replacement and technical servicing center in Addis Ababa.
              </p>
            </div>

            <div className="p-6 bg-kith-subBg/60 border border-sara-red/20 space-y-2 rounded-sm hover:border-sara-red/40 transition-colors">
              <div className="w-10 h-10 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-sara-red dark:text-red-400" />
              </div>
              <h3 className="text-sm font-bold font-mono text-kith-bone uppercase">Turnkey Installation</h3>
              <p className="text-xs font-mono text-kith-muted leading-relaxed">
                Site load auditing, certified electrical sizing, structural mounting, and preventative telemetry maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal Overlay */}
      <QuickViewModal
        product={selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
      />
    </div>
  );
}
