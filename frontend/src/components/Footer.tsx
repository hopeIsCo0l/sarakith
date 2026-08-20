'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Zap, ArrowUpRight, Cpu } from 'lucide-react';
import {
  COMPANY_NAME,
  COMPANY_SHORT_NAME,
  PRIMARY_PHONE,
  SECONDARY_PHONE,
  OFFICIAL_EMAIL,
  PHYSICAL_ADDRESS,
  BUSINESS_HOURS,
  WHATSAPP_LINK,
} from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const { getSettingUrl } = useSiteSettings();

  const activeLogoUrl = theme === 'light'
    ? getSettingUrl('logo_light', '/logo.png')
    : getSettingUrl('logo_dark', '/logo.png');

  return (
    <footer className="border-t border-sara-red/30 bg-kith-subBg text-kith-bone relative overflow-hidden transition-colors">
      {/* Background Red Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sara-red/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sara-red/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Grid */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-sara-red/40 bg-black/60 p-1 flex items-center justify-center rounded-sm shadow-sm overflow-hidden">
                <img src={activeLogoUrl} alt="Sara Power Solution" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest text-kith-bone font-mono uppercase">
                  Sara Power
                </span>
                <span className="text-[10px] font-mono tracking-superwide text-sara-red dark:text-red-400 uppercase font-bold">
                  Energy Systems PLC
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-kith-muted leading-relaxed max-w-md">
              Specialized distributor and systems engineering contractor for Tier-1 solar panels, hybrid pure sine wave inverters, and high-voltage LiFePO4 lithium battery energy storage across Ethiopia.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 rounded-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                OFFICIAL WARRANTY BACKED
              </span>
            </div>

            {/* Display mode toggle in footer */}
            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-kith-muted mb-2">Display Theme</div>
              <ThemeToggle variant="segmented" />
            </div>
          </div>

          {/* Column 2: Equipment Categories */}
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase flex items-center gap-2 border-b border-sara-red/20 pb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Solar Inventory</span>
            </div>
            <ul className="space-y-2.5 text-xs font-mono text-kith-muted">
              <li>
                <Link href="/catalog" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Hybrid Inverters (3kW - 11kW)
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  LiFePO4 Lithium Storage
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Monocrystalline Solar Panels
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  MPPT Charge Controllers
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-sara-red dark:text-red-400 font-bold hover:underline flex items-center gap-1">
                  <Zap className="w-3 h-3 animate-pulse" />
                  Load Calculator Sizer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Engineering Services */}
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase flex items-center gap-2 border-b border-sara-red/20 pb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Engineering Services</span>
            </div>
            <ul className="space-y-2.5 text-xs font-mono text-kith-muted">
              <li>
                <Link href="/services" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Turnkey Solar Sizing & Setup
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Solar Water Pumping & Irrigation
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  Battery Bank Health & Upgrades
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-sara-red dark:hover:text-red-400 transition-colors flex items-center gap-1 group">
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  C&I Solar Micro-Grids
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase flex items-center gap-2 border-b border-sara-red/20 pb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Telemetry</span>
            </div>
            <div className="space-y-3 text-xs font-mono text-kith-muted">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sara-red dark:text-red-400 shrink-0 mt-0.5" />
                <span>{PHYSICAL_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sara-red dark:text-red-400 shrink-0" />
                <a href={WHATSAPP_LINK} className="hover:text-sara-red dark:hover:text-red-400 transition-colors">
                  {PRIMARY_PHONE} / {SECONDARY_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sara-red dark:text-red-400 shrink-0" />
                <a href={`mailto:${OFFICIAL_EMAIL}`} className="hover:text-sara-red dark:hover:text-red-400 transition-colors">
                  {OFFICIAL_EMAIL}
                </a>
              </div>
              <div className="pt-2 text-[10px] text-kith-darkMuted border-t border-sara-red/10">
                {BUSINESS_HOURS}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-sara-red/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-kith-darkMuted">
          <div>
            © {new Date().getFullYear()} {COMPANY_NAME}. All engineering telemetry rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-sara-red dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-sara-red animate-ping" />
              SYSTEM ACTIVE // 99.9% UPTIME
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
