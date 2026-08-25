'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Phone, Menu, X, ArrowRight, Sun, Zap } from 'lucide-react';
import { PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/context/ThemeContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';

interface NavbarProps {
  onSearchToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchToggle }) => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { getSettingUrl, getSettingValue } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const companyName = getSettingValue('company_name', 'Sara Power');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomeAtTop = pathname === '/' && !isScrolled;

  const activeLogoUrl = isHomeAtTop
    ? getSettingUrl('logo_dark', '/logo.png')
    : theme === 'light'
      ? getSettingUrl('logo_light', '/logo.png')
      : getSettingUrl('logo_dark', '/logo.png');

  interface NavLinkItem {
    label: string;
    href: string;
    highlight?: boolean;
  }

  const leftNavLinks: NavLinkItem[] = [
    { label: 'Equipment Catalog', href: '/catalog' },
    { label: 'Solar Calculator', href: '/calculator', highlight: true },
    { label: 'Solar Services', href: '/services' },
    { label: 'Featured Products', href: '/#featured' },
    { label: 'About Us', href: '/about' },
  ];

  const rightNavLinks: NavLinkItem[] = [

  ];

  const allMobileNavLinks: NavLinkItem[] = [...leftNavLinks, ...rightNavLinks];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 print:hidden ${isScrolled
        ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-md border-b border-slate-200/80 dark:border-sara-red/30'
        : isHomeAtTop
          ? 'bg-transparent border-b border-white/10'
          : 'bg-kith-bg/85 dark:bg-black/80 backdrop-blur-sm border-b border-sara-red/20'
        }`}
    >


      {/* Main Navbar Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">

        {/* Mobile Left: Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-800 dark:text-red-400 hover:text-sara-red transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Left Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-start">
          {leftNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 lg:px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all rounded-sm border flex items-center gap-1.5 ${isActive
                  ? 'text-sara-red dark:text-red-400 bg-sara-red/10 border-sara-red/40 shadow-sm'
                  : link.highlight
                    ? 'text-amber-600 dark:text-amber-400 hover:text-amber-500 hover:bg-amber-500/10 border-transparent hover:border-amber-500/30'
                    : isHomeAtTop
                      ? 'text-white/90 hover:text-white hover:bg-white/10 border-transparent'
                      : isScrolled
                        ? 'text-slate-700 hover:text-sara-red hover:bg-slate-100 border-transparent dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-sara-red/10'
                        : 'text-slate-800 dark:text-kith-bone hover:text-sara-red dark:hover:text-red-400 hover:bg-sara-red/5 border-transparent'
                  }`}
              >
                {link.highlight && <Zap className="w-3.5 h-3.5 animate-pulse text-amber-500" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Center: Brand Logo & Title */}
        <div className="flex items-center justify-center flex-shrink-0 mx-auto md:mx-0 md:absolute md:left-1/2 md:-translate-x-1/2">
          <Link href="/" className="flex items-stretch gap-2.5 sm:gap-3 group relative py-1">
            <div className="absolute inset-0 -m-2 rounded-full bg-sara-red/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
            
            {/* Logo Graphic */}
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-105 py-0.5 flex items-center">
              <Image src={activeLogoUrl} alt={companyName} width={46} height={46} className="h-full w-auto max-h-[38px] sm:max-h-[46px] object-contain mix-blend-multiply dark:invert dark:mix-blend-screen object-left" />
            </div>
            
            {/* Text Stack */}
            <div className="relative z-10 flex flex-col justify-between py-0.5">
              <span className={`text-[24px] sm:text-[32px] font-black leading-[0.8] tracking-wide transition-colors font-sans uppercase translate-y-[4px] sm:translate-y-[6px] ${isHomeAtTop
                ? 'text-white group-hover:text-white/80'
                : isScrolled
                  ? 'text-[#1a1f2e] dark:text-kith-bone group-hover:text-sara-red dark:group-hover:text-red-400'
                  : 'text-[#1a1f2e] dark:text-kith-bone group-hover:text-sara-red dark:group-hover:text-red-400'
                }`}>
                SARA
              </span>
              <span className={`text-[9px] sm:text-[11px] tracking-widest uppercase font-bold leading-none ${isHomeAtTop ? 'text-white/80' : 'text-[#6a1f20] dark:text-red-400'}`}>
                POWER SOLUTIONS PLC
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Right Navigation & Actions */}
        <div className="flex items-center justify-end flex-1 gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-1">
            {rightNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all rounded-sm border flex items-center gap-1.5 ${isActive
                    ? 'text-sara-red dark:text-red-400 bg-sara-red/10 border-sara-red/40 shadow-sm'
                    : isScrolled
                      ? 'text-slate-700 hover:text-sara-red hover:bg-slate-100 border-transparent dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-sara-red/10'
                      : 'text-slate-800 dark:text-kith-bone hover:text-sara-red dark:hover:text-red-400 hover:bg-sara-red/5 border-transparent'
                    }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {onSearchToggle && (
            <button
              onClick={onSearchToggle}
              className={`p-2 rounded-sm transition-colors ${isHomeAtTop
                ? 'text-white/90 hover:text-white hover:bg-white/10'
                : isScrolled
                  ? 'text-slate-700 hover:text-sara-red hover:bg-slate-100 dark:text-red-400 dark:hover:bg-sara-red/10'
                  : 'text-sara-red dark:text-red-400 hover:bg-sara-red/10'
                }`}
              title="Search Database"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Theme Selector */}
          <ThemeToggle variant="dropdown" />

          {/* Contact Hotline Button */}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold tracking-widest uppercase text-white bg-sara-red hover:bg-sara-redLight border border-sara-red/60 shadow-[0_0_15px_rgba(111,15,16,0.25)] hover:shadow-[0_0_20px_rgba(111,15,16,0.45)] transition-all duration-200 group rounded-sm"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">{PRIMARY_PHONE}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-sara-red/30 bg-white/95 dark:bg-black/95 backdrop-blur-xl p-6 flex flex-col gap-3 shadow-2xl absolute w-full left-0 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-sara-red/20">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-kith-muted">
              THEME SELECTION
            </span>
            <ThemeToggle variant="segmented" />
          </div>

          {allMobileNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-mono font-bold tracking-widest uppercase py-3.5 px-4 border border-transparent hover:bg-sara-red/10 hover:border-sara-red/30 text-slate-800 dark:text-kith-bone hover:text-sara-red dark:hover:text-red-400 transition-all flex items-center gap-2 rounded-sm"
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
