import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { SolarCalculator } from '@/components/SolarCalculator';
import { ProductGridSection } from '@/components/ProductGridSection';
import { getServerProducts } from '@/lib/server/data';
import { buildPageMetadata, JsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/server/seo';
import { PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  title: 'Household Solar Power & Inverter Sizing Calculator',
  description:
    'Size your solar system in real time: enter household appliances or your peak kW load and get the recommended inverter capacity, LiFePO4 battery storage and PV array for Addis Ababa.',
  path: '/calculator',
  keywords: [
    'solar calculator Ethiopia',
    'inverter sizing calculator',
    'battery bank sizing Addis Ababa',
    'solar panel array calculator',
  ],
});

const FAQ = [
  {
    question: 'How do I size a solar system for my house?',
    answer:
      'Add your appliances and daily run hours, or enter your peak load in kilowatts. The calculator converts that into continuous load, storage autonomy and array size using Ethiopia peak sun hours.',
  },
  {
    question: 'How much battery backup do I need in Addis Ababa?',
    answer:
      'Most households choose 8 to 12 hours of night-time autonomy. The calculator sizes the LiFePO4 bank from your night-time load and the selected autonomy window.',
  },
  {
    question: 'Which inverter capacity should I install?',
    answer:
      'The inverter should cover your continuous load with headroom for surge currents from pumps and air conditioners. The calculator applies a safety margin to the measured peak load.',
  },
];

export default async function SolarCalculatorPage() {
  const allProducts = await getServerProducts();
  const solarProducts = allProducts
    .filter(
      (p) =>
        p.category?.slug === 'solar-panels-inverters' ||
        p.category?.slug === 'solar-batteries-controllers' ||
        p.name.toLowerCase().includes('solar') ||
        p.name.toLowerCase().includes('battery') ||
        p.name.toLowerCase().includes('inverter')
    )
    .slice(0, 4);

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 py-10 space-y-12 print:p-0 print:m-0 print:max-w-none print:space-y-0">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Calculator', path: '/calculator' },
        ])}
      />
      <JsonLd data={faqJsonLd(FAQ)} />

      {/* Top Breadcrumb & Page Banner */}
      <div className="border-b border-kith-border pb-6 space-y-2 print:hidden">
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-superwide text-kith-muted uppercase">
          <Link href="/" className="hover:text-kith-bone transition-colors">
            HOME
          </Link>
          <span>//</span>
          <span className="text-amber-500 font-bold">FR-2 SOLAR CALCULATOR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase text-kith-bone">
          HOUSEHOLD SOLAR POWER & INVERTER SIZING CALCULATOR
        </h1>
        <p className="text-xs sm:text-sm font-mono text-kith-muted max-w-3xl leading-relaxed">
          Accurately size your solar energy system for homes, villas, commercial buildings, and off-grid facilities in Ethiopia. Calculate exact Kilowatt (kW) inverter capacity, Lithium (LiFePO4) storage, and solar panel arrays with real-time equipment matching.
        </p>
      </div>

      {/* Main Interactive Solar Calculator Component */}
      <SolarCalculator initialMode="appliance" />

      {/* Matching Catalog Hardware Section */}
      <section className="space-y-6 pt-8 border-t border-kith-border print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono tracking-superwide text-kith-muted uppercase">
              IN STOCK IN ADDIS ABABA
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-kith-bone">
              RECOMMENDED SOLAR HARDWARE IN OUR CATALOG
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-mono uppercase tracking-widest text-kith-muted hover:text-kith-bone flex items-center gap-1.5"
          >
            <span>VIEW COMPLETE HARDWARE CATALOG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGridSection products={solarProducts} />
      </section>

      {/* Turnkey Engineering Callout */}
      <section className="p-8 bg-kith-subBg border border-kith-border flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FULL TURNKEY ENGINEERING & COMMISSIONING</span>
          </div>
          <h2 className="text-xl font-bold font-mono uppercase text-kith-bone">
            Need a Custom Site Assessment or Commercial Solar Engineering?
          </h2>
          <p className="text-xs font-mono text-kith-muted leading-relaxed">
            Our certified electrical engineers provide on-site roof irradiance analysis, 3-phase inverter load balancing, and battery bank upgrades throughout Addis Ababa and regional zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-widest font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>TALK TO SOLAR ENGINEER</span>
          </a>
          <Link
            href="/services"
            className="px-6 py-3.5 bg-kith-card border border-kith-border hover:border-kith-bone text-kith-bone text-xs font-mono uppercase tracking-widest font-bold transition-all"
          >
            VIEW SERVICES & PRICING
          </Link>
        </div>
      </section>
    </div>
  );
}
