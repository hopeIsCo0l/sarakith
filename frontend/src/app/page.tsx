'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sun, ShieldCheck, Zap, Sparkles, Terminal, Activity, CheckCircle, Building2, Award, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/components/ProductGrid';
import { QuickViewModal } from '@/components/QuickViewModal';
import { HERO_HEADER, BRAND_TAGLINE } from '@/lib/constants';
import heroBannerImg from '@/ass/HeroBanner.png';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { getSettingUrl } = useSiteSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

  // Carousel State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const { theme } = useTheme();

  // Gather valid banner URLs based on theme
  const bannerUrls = theme === 'light'
    ? [
        getSettingUrl('hero_banner_light_1', '/cinematic_hero.png'),
        getSettingUrl('hero_banner_light_2', ''),
        getSettingUrl('hero_banner_light_3', ''),
        getSettingUrl('hero_banner_light_4', ''),
      ].filter(url => url && url.trim() !== '')
    : [
        getSettingUrl('hero_banner_dark_1', '/cinematic_hero.png'),
        getSettingUrl('hero_banner_dark_2', ''),
        getSettingUrl('hero_banner_dark_3', ''),
        getSettingUrl('hero_banner_dark_4', ''),
      ].filter(url => url && url.trim() !== '');

  useEffect(() => {
    if (bannerUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerUrls.length, lastInteraction]);

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    setLastInteraction(Date.now());
  };

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerUrls.length) % bannerUrls.length);
    setLastInteraction(Date.now());
  };

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
    <div className="-mt-20 sm:-mt-24 space-y-20 pb-24 transition-colors">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] sm:h-screen flex flex-col justify-end overflow-hidden border-b border-sara-red/25">
        {/* Full Bleed Background Carousel */}
        <div className="absolute inset-0 z-0 bg-black">
          {bannerUrls.map((url, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentBannerIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <Image
                src={url}
                alt={`Sara Power Solution Systems - Slide ${idx + 1}`}
                fill
                priority={idx === 0}
                className="object-cover object-center scale-105"
              />
            </div>
          ))}
          {/* Subtle gradient overlay to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none z-10" />
        </div>

        {/* Navigation Arrows & Counter (only show if > 1 banner) */}
        {bannerUrls.length > 1 && (
          <>
            <button
              onClick={handlePrevBanner}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all rounded-sm group hidden sm:block shadow-xl"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleNextBanner}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all rounded-sm group hidden sm:block shadow-xl"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Slide Counter / Indicators */}
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-white/20 rounded-sm shadow-xl">
              <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
                {String(currentBannerIndex + 1).padStart(2, '0')} <span className="text-white/50">/ {String(bannerUrls.length).padStart(2, '0')}</span>
              </span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-white/20 pl-4">
                {bannerUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentBannerIndex(idx);
                      setLastInteraction(Date.now());
                    }}
                    className={`h-1.5 transition-all duration-300 rounded-sm ${
                      idx === currentBannerIndex ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Hero Content Overlaid */}
        <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-8 pb-20 sm:pb-32 w-full flex flex-col items-center text-center">
          
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-white/20 bg-black/40 backdrop-blur-md text-[10px] sm:text-xs font-mono font-bold tracking-superwide uppercase text-white shadow-xl rounded-sm">
            <Terminal className="w-3.5 h-3.5 text-white" />
            SARA POWER SOLUTION PLC // TIER-1 SYSTEMS
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] font-mono drop-shadow-2xl">
            {HERO_HEADER}
          </h1>

          {/* Description */}
          <p className="mt-6 text-xs sm:text-sm font-mono text-gray-200 leading-relaxed max-w-3xl drop-shadow-lg">
            {BRAND_TAGLINE}. Discover high-efficiency monocrystalline solar panels, hybrid pure sine wave inverters, and LiFePO4 lithium batteries engineered for lasting performance across Ethiopia.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/catalog"
              className="w-full sm:w-auto px-10 py-4 bg-white text-black hover:bg-gray-200 text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              EXPLORE EQUIPMENT
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/calculator"
              className="w-full sm:w-auto px-10 py-4 bg-black/40 backdrop-blur-md text-white border border-white/30 hover:bg-black/60 hover:border-white text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 rounded-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              LOAD CALCULATOR
            </Link>
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
