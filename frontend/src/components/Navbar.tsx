'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Phone, Menu, X, ArrowRight, Sun, Zap } from 'lucide-react';
import { COMPANY_SHORT_NAME, PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface NavbarProps {
  onSearchToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchToggle }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { getSettingUrl } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeLogoUrl = theme === 'light'
    ? getSettingUrl('logo_light', '/logo.png')
    : getSettingUrl('logo_dark', '/logo.png');

  const navLinks = [
    { label: 'Equipment Catalog', href: '/catalog' },
    { label: 'Solar Calculator', href: '/calculator', highlight: true },
    { label: 'Featured Products', href: '/#featured' },
    { label: 'Solar Services', href: '/services' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-kith-bg/90 backdrop-blur-md shadow-[0_4px_30px_rgba(111,15,16,0.08)] transition-all border-b border-sara-red/25">
      {/* Top Telemetry Banner */}
      <div className="bg-sara-red/10 dark:bg-sara-red/20 text-sara-red dark:text-red-300 px-4 py-1.5 text-[10px] sm:text-xs tracking-superwide font-mono flex items-center justify-between border-b border-sara-red/15">
        <span className="hidden sm:flex items-center gap-2">
          <Sun className="w-3 h-3 inline text-amber-500" /> SYSTEM ONLINE // GRID STABLE
        </span>
        <span className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold text-sara-red dark:text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#6f0f10]"></span>
          SARA POWER TELEMETRY ACTIVE
        </span>
        <span className="hidden sm:inline text-kith-muted">ADDIS ABABA, ETHIOPIA</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="absolute inset-0 -m-1 rounded-full bg-sara-red/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 border border-sara-red/40 bg-black/60 p-1 flex items-center justify-center rounded-sm shadow-sm overflow-hidden">
              <img src={activeLogoUrl} alt="Sara Power Solution" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xl sm:text-2xl font-black tracking-widest text-kith-bone group-hover:text-sara-red dark:group-hover:text-red-400 transition-colors font-mono uppercase">
                Sara Power
              </span>
              <span className="text-[9px] font-mono tracking-superwide text-sara-red dark:text-red-400 uppercase font-bold">
                Energy Systems
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all rounded-sm border flex items-center gap-2 ${
                    isActive
                      ? 'text-sara-red dark:text-red-400 bg-sara-red/15 border-sara-red/50 shadow-[0_0_12px_rgba(111,15,16,0.2)]'
                      : link.highlight
                      ? 'text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:bg-amber-500/10 border-transparent hover:border-amber-500/30'
                      : 'text-kith-muted hover:text-sara-red dark:hover:text-red-400 hover:bg-sara-red/5 border-transparent hover:border-sara-red/25'
                  }`}
                >
                  {link.highlight && <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {onSearchToggle && (
            <button
              onClick={onSearchToggle}
              className="p-2 text-sara-red dark:text-red-400 hover:bg-sara-red/10 border border-transparent hover:border-sara-red/30 rounded-sm transition-colors"
              title="Search Database"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Theme Selector */}
          <ThemeToggle variant="dropdown" />

          {/* Contact CTA Button - Sara Red & White */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold tracking-widest uppercase text-white bg-sara-red hover:bg-sara-redLight border border-sara-red/60 shadow-[0_0_15px_rgba(111,15,16,0.35)] hover:shadow-[0_0_20px_rgba(111,15,16,0.5)] transition-all duration-200 group rounded-sm"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span>{PRIMARY_PHONE}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-sara-red dark:text-red-400"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-sara-red/30 bg-kith-bg/95 backdrop-blur-xl p-6 flex flex-col gap-3 shadow-2xl absolute w-full left-0 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-sara-red/20">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-kith-muted">
              THEME SELECTION
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-mono font-bold tracking-widest uppercase py-3.5 px-4 border border-transparent hover:bg-sara-red/10 hover:border-sara-red/30 text-kith-bone hover:text-sara-red dark:hover:text-red-400 transition-all flex items-center gap-2 rounded-sm"
            >
              {link.highlight && <Zap className="w-4 h-4 text-amber-500" />}
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-sara-red/20 flex flex-col gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-sara-red text-white text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>CALL // {PRIMARY_PHONE}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
