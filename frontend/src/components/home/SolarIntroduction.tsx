import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Building2, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { getServerSiteSettings, readSetting } from '@/lib/server/data';

const solutions = [
  { name: 'Residential', id: 'residential', image: 'photo-1613665813446-82a78c468a1d', description: 'Solar and battery backup designed around your home, your appliances and your daily routine.', detail: 'Explore home solar sizing', href: '/calculator' },
  { name: 'Commercial', id: 'commercial', image: 'photo-1508514177221-188b1cf16e9d', description: 'Scalable solar systems for offices, shops and facilities that need dependable power.', detail: 'Explore commercial services', href: '/services' },
  { name: 'Industrial', id: 'industrial', image: 'photo-1548337138-e87d889cc369', description: 'Engineered power solutions for larger loads, agricultural projects and demanding sites.', detail: 'Discuss an industrial project', href: '/services' },
];

function SolarIllustration() {
  return (
    <div className="relative min-h-[300px] sm:min-h-[380px] overflow-hidden bg-[#210c10] border border-white/15">
      <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full" role="img" aria-label="Sunlight reaching rooftop solar panels and powering a home">
        <defs>
          <radialGradient id="solar-sun-glow"><stop stopColor="#ffe5a3" stopOpacity=".5" /><stop offset="1" stopColor="#ffe5a3" stopOpacity="0" /></radialGradient>
          <linearGradient id="solar-sky" x2="1" y2="1"><stop stopColor="#65303a" /><stop offset="1" stopColor="#210c10" /></linearGradient>
          <pattern id="solar-cells" width="28" height="20" patternUnits="userSpaceOnUse"><rect width="28" height="20" fill="#7c9bad" /><path d="M28 0H0V20" fill="none" stroke="#d3e2e8" strokeWidth="1" /></pattern>
        </defs>
        <path fill="url(#solar-sky)" d="M0 0h640v400H0z" />
        <circle cx="420" cy="95" r="160" fill="url(#solar-sun-glow)" />
        <g stroke="#e8c983" strokeWidth="1">
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M420 42V25" transform={`rotate(${i * 30} 420 95)`} />)}
        </g>
        <circle cx="420" cy="95" r="30" fill="#ffe4a2" /><circle cx="420" cy="95" r="17" fill="#fff2cf" />
        <path d="M405 120L245 285H460L435 120" fill="#ffe5a3" opacity=".08" />
        <path d="M195 300L325 205L455 300V370H195Z" fill="#150a10" />
        <path d="M214 296H436V370H214Z" fill="#71323c" />
        <path d="M183 300L325 196L467 300H446L325 216L204 300Z" fill="#ac6167" />
        <path d="M258 251L362 216L381 253L277 289Z" fill="url(#solar-cells)" stroke="#e6cd97" strokeWidth="3" />
        <path d="M309 328H337V370H309Z" fill="#240e17" />
        <path d="M237 320H260V342H237ZM387 320H410V342H387Z" fill="#ffe5a3" />
        <path d="M120 371H520" stroke="#e8c983" opacity=".4" />
      </svg>
      <div className="relative p-6 text-[#ffe5a3]"><p className="text-4xl sm:text-5xl font-light">Sunlight. Reimagined.</p><p className="mt-3 text-[10px] uppercase tracking-[.25em]">From your rooftop to your everyday</p></div>
      <p className="absolute bottom-5 left-6 text-[10px] uppercase tracking-[.25em] text-[#ffe5a3]">Light becomes power.</p>
    </div>
  );
}

export async function SolarIntroduction() {
  const settings = await getServerSiteSettings();
  const highlights = [
    { value: readSetting(settings, 'stat_completed_projects', '500+'), label: 'Completed projects', icon: Building2 },
    { value: readSetting(settings, 'stat_installed_mw', '5.5+ MW'), label: 'Installed capacity', icon: Zap },
    { value: readSetting(settings, 'stat_warranty_years', '5 YEARS'), label: 'Local warranty support', icon: ShieldCheck },
    { value: 'Addis Ababa', label: 'Based in Ethiopia', icon: MapPin },
  ];

  return (
    <div className="space-y-0">
      <section aria-labelledby="solar-intro-heading" className="mx-auto max-w-[1700px] px-4 sm:px-8 pb-14 sm:pb-20 grid lg:grid-cols-[.85fr_1.15fr] gap-10 lg:gap-16 items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[.25em] text-sara-red dark:text-red-300">The standard <span aria-hidden="true" className="inline-block ml-3 mb-1 w-12 border-t border-current" /></p>
          <h2 id="solar-intro-heading" className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-kith-bone">The sun doesn’t<br />send a bill.</h2>
          <p className="text-2xl sm:text-3xl text-sara-red dark:text-red-300">Make its energy work for you.</p>
          <p className="max-w-lg text-sm sm:text-base leading-7 text-kith-muted">Solar for homes, businesses and industry — designed around your energy needs, engineered for the long term, and supported here in Ethiopia.</p>
          <div className="flex flex-wrap gap-2">{solutions.map(({ name, id }) => <a key={id} href={`#solar-${id}`} className="border border-kith-border px-4 py-3 text-[10px] uppercase tracking-widest text-kith-bone hover:bg-sara-red hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">{name}</a>)}</div>
        </div>
        <SolarIllustration />
      </section>

      <section aria-label="Sara Solar at a glance" className="bg-kith-subBg border-y border-kith-border py-10 sm:py-14">
        <div className="mx-auto max-w-[1700px] px-4 sm:px-8 grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map(({ value, label, icon: Icon }, index) => <div key={label} className="bg-kith-bg border border-kith-border p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center text-sara-red dark:text-red-300"><span className="text-[10px] tracking-widest">0{index + 1}</span><Icon className="w-5 h-5" aria-hidden="true" /></div>
            <p className="text-3xl sm:text-4xl tracking-tight text-kith-bone">{value}</p>
            <p className="text-[10px] uppercase tracking-[.2em] text-kith-muted">{label}</p>
          </div>)}
        </div>
      </section>

      <section aria-labelledby="solar-solutions-heading" className="bg-[#210c10] py-14 sm:py-20 text-white">
        <div className="mx-auto max-w-[1700px] px-4 sm:px-8">
          <p className="text-xs uppercase tracking-[.25em] text-[#e8c983] mb-5">Built for every need</p>
          <h2 id="solar-solutions-heading" className="text-4xl sm:text-6xl tracking-tight font-bold">Solar, built around you.</h2>
          <p className="max-w-xl text-sm sm:text-base leading-7 text-white/75 mt-5 mb-10">Three scales of system. One standard of care — from a home rooftop to commercial facilities and industrial projects.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {solutions.map(({ name, id, image, description, detail, href }, index) => <Link id={`solar-${id}`} href={href} key={id} aria-label={detail} className="group relative min-h-[380px] lg:min-h-[500px] overflow-hidden border border-white/20 scroll-mt-28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8c983]">
              <Image src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=1000&q=80`} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
              <span className="absolute top-6 left-6 text-2xl text-[#ffe5a3]">0{index + 1}</span>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between gap-3"><h3 className="text-3xl lg:text-4xl font-bold">{name}</h3><ArrowUpRight aria-hidden="true" className="shrink-0 w-5 h-5" /></div>
                <p className="text-sm leading-6 text-white/85">{description}</p>
                <span className="block text-xs underline underline-offset-4 text-[#ffe5a3]">{detail}</span>
              </div>
            </Link>)}
          </div>
        </div>
      </section>
    </div>
  );
}
