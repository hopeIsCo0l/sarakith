import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sun,
  ShieldCheck,
  Zap,
  Terminal,
  Building2,
  Award,
  Users,
  Layers,
} from 'lucide-react';
import { getServerCategories } from '@/lib/server/data';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { buildPageMetadata, JsonLd, localBusinessJsonLd } from '@/lib/server/seo';
import { BRAND_TAGLINE, SEARCH_KEYWORDS } from '@/lib/constants';

export const revalidate = 300;

export const metadata = buildPageMetadata({
  title: 'Tier-1 Solar Inverters, Lithium Batteries & Panels',
  description: `${BRAND_TAGLINE}. Discover high-efficiency hybrid solar inverters, LiFePO4 lithium batteries, and engineering installation services in Addis Ababa, Ethiopia.`,
  path: '/',
  keywords: SEARCH_KEYWORDS,
});

export default async function HomePage() {
  const categories = await getServerCategories();
  const parentCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="-mt-20 sm:-mt-24 space-y-20 pb-24 transition-colors">
      <JsonLd data={localBusinessJsonLd()} />

      {/* Hero Section */}
      <HeroCarousel />

      {/* Parent Categories Section */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 space-y-6 relative z-10 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-sara-red/30 pb-4 gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase block mb-1 flex items-center gap-2">
              <Layers className="w-3 h-3" /> CATEGORY_INDEX
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-kith-bone uppercase">
              Explore Our Catalogs
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10">
          {parentCategories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className={`group relative overflow-hidden bg-transparent rounded-sm border border-white/5 transition-all duration-700 hover:border-sara-red/40 hover:shadow-2xl flex flex-col ${index === 0 ? 'lg:col-span-2 lg:row-span-2 h-[400px] lg:h-[632px]' : 'h-[350px]'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>

              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="absolute inset-0 object-cover transition-transform duration-1000 group-hover:scale-[1.03] z-0 opacity-100"
                />
              ) : (
                <div className="absolute inset-0 bg-kith-subBg flex items-center justify-center z-0">
                  <span className="text-xs font-mono text-kith-muted uppercase">No Image</span>
                </div>
              )}

              <div className="relative z-20 flex flex-col justify-end h-full p-6 sm:p-10">
                <div className="w-10 h-[2px] bg-sara-red mb-4 sm:mb-6 transform origin-left transition-transform duration-500 scale-x-50 group-hover:scale-x-100"></div>

                <h3 className={`font-black font-sans uppercase text-white tracking-widest drop-shadow-2xl leading-[0.9] ${index === 0 ? 'text-4xl sm:text-6xl mb-4' : 'text-2xl sm:text-3xl mb-3'}`}>
                  {cat.name}
                </h3>

                <div className="flex items-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-superwide text-gray-300 group-hover:text-white transition-colors">
                    Explore Collection
                  </span>
                  <div className="w-6 h-[1px] bg-sara-red"></div>
                  <ArrowRight className="w-4 h-4 text-sara-red" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Capabilities Showcase */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="tech-panel p-10 space-y-4 group rounded-sm border border-sara-red/30">
            <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-6 group-hover:bg-sara-red/20 transition-colors shadow-sm">
              <Sun className="w-6 h-6 text-sara-red dark:text-red-400" />
            </div>
            <h2 className="text-lg font-black font-mono text-kith-bone uppercase tracking-widest">
              Complete Solar Solutions
            </h2>
            <p className="text-xs font-mono text-kith-muted leading-relaxed">
              Tier-1 monocrystalline panels, hybrid pure sine wave inverters, MPPT controllers, and long-life lithium battery storage systems designed for Ethiopian conditions.
            </p>
          </div>

          <div className="tech-panel p-10 space-y-4 group rounded-sm border border-sara-red/30">
            <div className="w-12 h-12 bg-sara-red/10 border border-sara-red/30 flex items-center justify-center mb-6 group-hover:bg-sara-red/20 transition-colors shadow-sm">
              <ShieldCheck className="w-6 h-6 text-sara-red dark:text-red-400" />
            </div>
            <h2 className="text-lg font-black font-mono text-kith-bone uppercase tracking-widest">
              Verified Technical Specs
            </h2>
            <p className="text-xs font-mono text-kith-muted leading-relaxed">
              Detailed voltage rating, frequency response, wattage output, and dimensional specifications rigorously verified for every single catalog item.
            </p>
          </div>
        </div>
      </section>

      {/* FR-2 Solar Sizing Calculator Feature Section */}
      <section className="max-w-[1700px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="p-8 sm:p-14 tech-panel flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative overflow-hidden rounded-sm border border-sara-red/30">
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
    </div>
  );
}
