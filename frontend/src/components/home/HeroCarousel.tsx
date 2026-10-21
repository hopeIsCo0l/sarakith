'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_HEADER, BRAND_TAGLINE } from '@/lib/constants';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useTheme } from '@/context/ThemeContext';

/**
 * Client island for the homepage hero. The banner images come from the
 * editable site settings and the variant follows the active theme.
 */
export const HeroCarousel: React.FC = () => {
  const { getSettingUrl } = useSiteSettings();
  const { theme } = useTheme();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const bannerUrls = useMemo(() => {
    const keys =
      theme === 'light'
        ? ['hero_banner_light_1', 'hero_banner_light_2', 'hero_banner_light_3', 'hero_banner_light_4']
        : ['hero_banner_dark_1', 'hero_banner_dark_2', 'hero_banner_dark_3', 'hero_banner_dark_4'];

    const fallbacks = theme === 'light' ? ['/cinematic_hero.webp', '', '', ''] : ['/cinematic_hero.webp', '', '', ''];

    return keys
      .map((key, index) => getSettingUrl(key, fallbacks[index]))
      .filter((url) => url && url.trim() !== '');
  }, [theme, getSettingUrl]);

  useEffect(() => {
    if (bannerUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerUrls.length);
    }, 15000);
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

  return (
    <section className="relative w-full h-[85vh] sm:h-screen flex flex-col justify-end overflow-hidden border-b border-sara-red/25">
      {/* Full Bleed Background Carousel */}
      <div className="absolute inset-0 z-0 bg-black">
        {bannerUrls.map((url, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentBannerIndex
                ? 'opacity-100 z-0'
                : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <Image
              src={url}
              alt={`Sara Power Solution Systems - Slide ${idx + 1}`}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center scale-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none z-10" />
      </div>

      {/* Navigation Arrows & Counter (only show if > 1 banner) */}
      {bannerUrls.length > 1 && (
        <>
          <button
            onClick={handlePrevBanner}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 min-w-[48px] min-h-[48px] p-2 sm:p-3 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all rounded-sm group hidden sm:flex items-center justify-center shadow-xl"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleNextBanner}
            aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 min-w-[48px] min-h-[48px] p-2 sm:p-3 bg-black/20 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 transition-all rounded-sm group hidden sm:flex items-center justify-center shadow-xl"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 border border-white/20 rounded-sm shadow-xl">
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              {String(currentBannerIndex + 1).padStart(2, '0')}{' '}
              <span className="text-white/80">
                / {String(bannerUrls.length).padStart(2, '0')}
              </span>
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-white/20 pl-4">
              {bannerUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentBannerIndex(idx);
                    setLastInteraction(Date.now());
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="p-2 -my-2 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-white rounded-sm"
                >
                  <span
                    className={`h-1.5 transition-all duration-300 rounded-sm block ${
                      idx === currentBannerIndex
                        ? 'w-6 bg-white'
                        : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Hero Content Overlaid */}
      <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-8 pb-20 sm:pb-32 w-full flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-white/20 bg-black/40 backdrop-blur-md text-[10px] sm:text-xs font-mono font-bold tracking-superwide uppercase text-white shadow-xl rounded-sm">
          <Terminal className="w-3.5 h-3.5 text-white" />
          SARA POWER SOLUTION PLC // TIER-1 SYSTEMS
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[0.95] font-mono drop-shadow-2xl">
          {HERO_HEADER}
        </h1>

        <div className="mt-6 px-4 py-3 sm:px-6 sm:py-4 border border-white/20 bg-black/40 backdrop-blur-md shadow-xl rounded-sm inline-flex items-center justify-center max-w-3xl">
          <p className="text-left text-xs sm:text-sm md:text-base font-mono text-gray-200 leading-relaxed drop-shadow-lg uppercase tracking-wide">
            {BRAND_TAGLINE}. Discover high-efficiency monocrystalline solar panels, hybrid pure sine wave inverters, and LiFePO4 lithium batteries engineered for lasting performance across Ethiopia.
          </p>
        </div>

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
  );
};
