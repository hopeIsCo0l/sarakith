'use client';

import React, { useState, useEffect } from 'react';
import { getServices, supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { ServiceCard } from '@/components/ServiceCard';
import { PRIMARY_PHONE, WHATSAPP_LINK } from '@/lib/constants';
import { Layers, Sun, Phone, CheckCircle, Terminal, Zap } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function loadServices() {
      const data = await getServices();
      setServices(data);
    }
    loadServices();

    // 1. Instant re-fetch on window focus
    const handleFocus = () => loadServices();
    window.addEventListener('focus', handleFocus);

    // 2. Cross-tab & intra-window broadcast sync
    const broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sara_power_sync') : null;
    if (broadcast) {
      broadcast.onmessage = () => loadServices();
    }
    window.addEventListener('sara_data_updated', loadServices);

    // 3. Live Supabase Realtime Postgres Changes Subscription
    let channel: any;
    if (supabase) {
      channel = supabase
        .channel('realtime_services_page')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
          loadServices();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('sara_data_updated', loadServices);
      if (broadcast) broadcast.close();
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  const workflowSteps = [
    {
      step: '01',
      title: 'Site Load Audit',
      desc: 'Technical site survey in Addis Ababa to calculate daily kilowatt-hour demand and solar irradiance parameters.',
    },
    {
      step: '02',
      title: 'System Design & Sizing',
      desc: 'Custom solar array sizing, hybrid inverter specification, and lithium battery storage configuration.',
    },
    {
      step: '03',
      title: 'Hardware Mounting',
      desc: 'Professional roof panel mounting, DC disconnect wiring, and LiFePO4 battery BMS calibration.',
    },
    {
      step: '04',
      title: 'Commissioning & Telemetry',
      desc: 'Full load testing under grid-tied/off-grid mode, MPPT charging calibration, and telemetry setup.',
    },
  ];

  return (
    <div className="bg-kith-bg pb-24 transition-colors">
      {/* Header Banner */}
      <div className="border-b border-sara-red/30 bg-kith-subBg/80 pt-16 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sara-red/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sara-red/10 border border-sara-red/30 text-sara-red dark:text-red-400 text-xs font-mono font-bold tracking-widest uppercase rounded-sm">
            <Terminal className="w-3.5 h-3.5" />
            Sara Power Engineering Systems // Services Log
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-kith-bone uppercase leading-tight">
            Turnkey Solar & Electrical Engineering Services
          </h1>
          <p className="text-sm sm:text-base font-mono text-kith-muted max-w-3xl leading-relaxed">
            From high-capacity hybrid solar inverters and LiFePO4 lithium battery banks to agricultural solar water pumping and commercial micro-grids, we deliver high-reliability systems across Ethiopia.
          </p>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 pt-12 space-y-20">
        {/* Services List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-sara-red/20 pb-4">
            <h2 className="text-xs font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Available Engineering Procedures ({services.length})
            </h2>
          </div>

          <div className="space-y-8">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </section>

        {/* Workflow Process Step Section */}
        <section className="tech-panel p-8 sm:p-14 space-y-12 rounded-sm border border-sara-red/30">
          <div className="space-y-3 border-b border-sara-red/20 pb-6">
            <span className="text-xs font-mono font-bold tracking-superwide text-sara-red dark:text-red-400 uppercase block">
              ENGINEERING PROTOCOL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-kith-bone uppercase">
              End-to-End System Deployment Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws) => (
              <div key={ws.step} className="bg-kith-subBg/60 border border-sara-red/20 p-6 space-y-3 hover:border-sara-red/50 transition-all rounded-sm">
                <span className="text-3xl font-mono font-black text-sara-red dark:text-red-400 block">
                  {ws.step}
                </span>
                <h3 className="text-sm font-mono font-bold text-kith-bone uppercase tracking-wider">
                  {ws.title}
                </h3>
                <p className="text-xs font-mono text-kith-muted leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="pt-8 border-t border-sara-red/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-base font-mono font-bold text-kith-bone uppercase">
                Need a Custom Engineering Consultation?
              </h4>
              <p className="text-xs font-mono text-kith-muted mt-1">
                Contact Sara Power Solution plc directly to schedule an on-site technical survey and customized sizing report.
              </p>
            </div>

            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent('Hello Sara Power Solution plc, I would like to request an engineering consultation for solar power systems.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-sara-red text-white hover:bg-sara-redLight border border-sara-red/60 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(111,15,16,0.35)] rounded-sm"
            >
              <Phone className="w-4 h-4" />
              DIRECT LINE // {PRIMARY_PHONE}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
