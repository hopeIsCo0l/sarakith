'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Sun,
  Zap,
  CheckCircle,
  Terminal,
  Building2,
  Award,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function AboutPage() {
  const { getSettingValue } = useSiteSettings();

  const companyName = getSettingValue('company_name', 'Sara Power Solution PLC');
  const aboutMission = getSettingValue(
    'about_mission',
    "Sara Power Solution PLC is Ethiopia's premier distributor and systems engineering contractor for high-efficiency monocrystalline solar panels, pure sine wave hybrid inverters, and high-voltage LiFePO4 battery energy storage."
  );
  const physicalAddress = getSettingValue('contact_address', 'Sara Building, Lideta Sub-City, Addis Ababa, Ethiopia');
  const primaryPhone = getSettingValue('contact_phone_primary', '+251 91 123 4567');
  const secondaryPhone = getSettingValue('contact_phone_secondary', '+251 91 765 4321');
  const officialEmail = getSettingValue('contact_email', 'info@sarapowersolution.com');
  const businessHours = getSettingValue('contact_business_hours', 'Mon - Sat: 8:00 AM - 6:00 PM (Local Time)');
  const whatsappUrl = getSettingValue('contact_whatsapp', 'https://wa.me/251910809090');

  const statMW = getSettingValue('stat_installed_mw', '5.5+ MW');
  const statProjects = getSettingValue('stat_completed_projects', '500+');
  const statWarranty = getSettingValue('stat_warranty_years', '5 YEARS');

  const stats = [
    { label: 'INSTALLED SOLAR CAPACITY', value: statMW, sub: 'Across Commercial & Residential' },
    { label: 'COMPLETED PROJECTS', value: statProjects, sub: 'High-Reliability Telemetry Systems' },
    { label: 'BATTERY CYCLE RATING', value: '6,000+', sub: 'LiFePO4 Lithium Deep Discharge' },
    { label: 'LOCAL WARRANTY', value: statWarranty, sub: 'Factory Backed Service Guarantee' },
  ];

  const pillars = [
    {
      icon: Award,
      title: 'Tier-1 Certified Hardware',
      desc: 'We strictly source factory-direct Tier-1 solar panels, hybrid pure sine wave inverters, and Smart BMS Lithium storage packs from top global manufacturers.',
    },
    {
      icon: Zap,
      title: 'Turnkey Systems Engineering',
      desc: 'From initial site load auditing and electrical sizing to precise structural mounting, our certified engineers deliver complete turnkey solar installations.',
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Local Warranty',
      desc: 'No waiting on international RMA processes. We honor local hardware replacement, full technical diagnostics, and warranty support right here in Addis Ababa.',
    },
    {
      icon: Users,
      title: 'Dedicated Client Telemetry',
      desc: 'Our engineering team monitors system health and provides preventative maintenance services to maximize ROI and operational longevity.',
    },
  ];

  return (
    <div className="bg-kith-bg pb-24 transition-colors">
      {/* Header Banner */}
      <div className="border-b border-sara-red/30 bg-kith-subBg/80 pt-16 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sara-red/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase">
            <Terminal className="w-3.5 h-3.5" />
            {companyName} // Corporate Overview
          </div>
          <h1 className="text-3xl sm:text-6xl font-black font-mono tracking-widest text-kith-bone uppercase leading-tight">
            ABOUT {companyName}
          </h1>
          <p className="text-sm font-mono text-kith-muted max-w-3xl leading-relaxed border-l-2 border-sara-red/50 pl-4">
            {aboutMission}
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-16 space-y-20">
        
        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 text-xs font-mono font-bold uppercase tracking-widest rounded-sm">
              <Building2 className="w-4 h-4" />
              OUR MISSION & ENGINE
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono text-kith-bone uppercase tracking-tight leading-snug">
              POWERING ETHIOPIA WITH RELIABLE TIER-1 SOLAR ENERGY
            </h2>
            <p className="text-xs sm:text-sm font-mono text-kith-muted leading-relaxed border-l-2 border-sara-red/40 pl-4">
              {aboutMission}
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="px-6 py-3.5 bg-sara-red text-white hover:bg-sara-redLight text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-sm"
              >
                <span>BROWSE CATALOG</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-sara-red/10 text-sara-red dark:text-red-400 border border-sara-red/40 hover:bg-sara-red/20 text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 rounded-sm"
              >
                <Phone className="w-4 h-4" />
                <span>SPEAK WITH ENGINEER</span>
              </a>
            </div>
          </div>

          {/* Right Column Metric Badges */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="tech-panel p-6 border border-sara-red/30 space-y-2 rounded-sm bg-kith-card hover:border-sara-red/60 transition-colors"
              >
                <span className="text-[10px] font-mono text-sara-red dark:text-red-400 font-bold uppercase tracking-widest block">
                  {s.label}
                </span>
                <span className="text-3xl font-mono font-black text-kith-bone block">{s.value}</span>
                <span className="text-[10px] font-mono text-kith-muted block">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Pillars of Excellence Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-sara-red dark:text-red-400 tracking-widest uppercase block">
              ENGINEERING STANDARDS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-mono text-kith-bone uppercase">
              WHY {companyName}?
            </h2>
            <div className="w-16 h-0.5 bg-sara-red mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const IconComp = p.icon;
              return (
                <div
                  key={idx}
                  className="tech-panel p-8 space-y-4 border border-sara-red/30 rounded-sm bg-kith-card hover:border-sara-red/60 transition-colors group"
                >
                  <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center group-hover:bg-sara-red/20 transition-colors">
                    <IconComp className="w-6 h-6 text-sara-red dark:text-red-400" />
                  </div>
                  <h3 className="text-base font-bold font-mono text-kith-bone uppercase">{p.title}</h3>
                  <p className="text-xs font-mono text-kith-muted leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corporate Address & Contact Banner */}
        <div className="tech-panel p-8 sm:p-12 border border-sara-red/40 rounded-sm bg-kith-card space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-sara-red/25 pb-8">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-sara-red dark:text-red-400 uppercase tracking-widest">
                HEADQUARTERS & SHOWROOM
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-kith-bone uppercase">
                VISIT OUR FACILITY
              </h2>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-sara-red text-white font-mono text-xs uppercase font-bold tracking-widest hover:bg-sara-redLight transition-colors rounded-sm inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" /> SCHEDULE A SITE VISIT
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-mono">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sara-red dark:text-red-400 font-bold uppercase">
                <MapPin className="w-4 h-4" /> Physical Address
              </div>
              <p className="text-kith-bone leading-relaxed">{physicalAddress}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sara-red dark:text-red-400 font-bold uppercase">
                <Phone className="w-4 h-4" /> Direct Phone Lines
              </div>
              <p className="text-kith-bone">{primaryPhone}</p>
              {secondaryPhone && <p className="text-kith-bone">{secondaryPhone}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sara-red dark:text-red-400 font-bold uppercase">
                <Mail className="w-4 h-4" /> Official Inquiries
              </div>
              <p className="text-kith-bone">{officialEmail}</p>
              <p className="text-kith-muted">{businessHours}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
