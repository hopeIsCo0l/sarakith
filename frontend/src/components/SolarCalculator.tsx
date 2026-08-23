'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Sun,
  Zap,
  Battery,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Info,
  Phone,
  RotateCcw,
  Sparkles,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Tv,
  Fan,
  Laptop,
  Wifi,
  Coffee,
  Wind,
  Waves,
  Lightbulb,
  Refrigerator,
  Flame,
  Send,
} from 'lucide-react';
import {
  PRESET_APPLIANCES,
  ApplianceItem,
  CustomAppliance,
  calculateSolarSizing,
  buildWhatsAppSizingMessage,
} from '@/lib/solarCalculator';
import { WHATSAPP_NUMBER, PRIMARY_PHONE, TELEGRAM_LINK } from '@/lib/constants';
import { getDynamicSolarPackages } from '@/lib/supabase';
import { Product } from '@/lib/types';

interface SolarCalculatorProps {
  initialMode?: 'appliance' | 'direct';
  compact?: boolean;
}

export const SolarCalculator: React.FC<SolarCalculatorProps> = ({
  initialMode = 'appliance',
  compact = false,
}) => {
  // Mode state: 'appliance' (Simple Mode) or 'direct' (Technical Mode)
  const [mode, setMode] = useState<'appliance' | 'direct'>(initialMode);

  // Appliance Mode State
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PRESET_APPLIANCES.forEach((app) => {
      initial[app.id] = app.defaultQuantity;
    });
    return initial;
  });

  const [hours, setHours] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PRESET_APPLIANCES.forEach((app) => {
      initial[app.id] = app.defaultHours;
    });
    return initial;
  });

  const [customAppliances, setCustomAppliances] = useState<CustomAppliance[]>([]);
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState(250);
  const [customHrs, setCustomHrs] = useState(4);
  const [customQty, setCustomQty] = useState(1);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Direct Mode State
  const [directPeakKW, setDirectPeakKW] = useState<number>(3.5);
  const [directDailyKWh, setDirectDailyKWh] = useState<number>(12.0);
  const [autonomyHours, setAutonomyHours] = useState<number>(12);

  // Selected package for detailed highlight
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-recommended');
  const [copied, setCopied] = useState(false);

  // Update quantity handler
  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  // Update hours handler
  const handleHoursChange = (id: string, newHours: number) => {
    const clamped = Math.max(0.5, Math.min(24, newHours));
    setHours((prev) => ({ ...prev, [id]: clamped }));
  };

  // Add custom appliance
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newItem: CustomAppliance = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      wattage: customWatts,
      quantity: customQty,
      hours: customHrs,
    };
    setCustomAppliances((prev) => [...prev, newItem]);
    setCustomName('');
    setCustomWatts(250);
    setCustomHrs(4);
    setCustomQty(1);
    setShowAddCustom(false);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomAppliances((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset all values
  const handleReset = () => {
    const initialQty: Record<string, number> = {};
    const initialHrs: Record<string, number> = {};
    PRESET_APPLIANCES.forEach((app) => {
      initialQty[app.id] = app.defaultQuantity;
      initialHrs[app.id] = app.defaultHours;
    });
    setQuantities(initialQty);
    setHours(initialHrs);
    setCustomAppliances([]);
    setDirectPeakKW(3.5);
    setDirectDailyKWh(12.0);
    setAutonomyHours(12);
  };

  // Calculations Pipeline
  const calculation = useMemo(() => {
    if (mode === 'direct') {
      const peakWatts = directPeakKW * 1000;
      const dailyWattHours = directDailyKWh * 1000;
      return calculateSolarSizing(peakWatts, dailyWattHours, autonomyHours);
    } else {
      let totalPeak = 0;
      let totalDaily = 0;

      PRESET_APPLIANCES.forEach((app) => {
        const q = quantities[app.id] || 0;
        const h = hours[app.id] || app.defaultHours;
        if (q > 0) {
          totalPeak += app.wattage * q;
          totalDaily += app.wattage * q * h;
        }
      });

      customAppliances.forEach((app) => {
        totalPeak += app.wattage * app.quantity;
        totalDaily += app.wattage * app.quantity * app.hours;
      });

      return calculateSolarSizing(totalPeak, totalDaily, autonomyHours);
    }
  }, [mode, quantities, hours, customAppliances, directPeakKW, directDailyKWh, autonomyHours]);

  // Packages list
  const [matchedPackages, setMatchedPackages] = useState<Product[]>([]);

  useEffect(() => {
    async function loadPackages() {
      const pkgs = await getDynamicSolarPackages(calculation.totalPeakKW);
      setMatchedPackages(pkgs);
      // Ensure we have a valid selection
      if (pkgs.length > 0 && !pkgs.find(p => p.id === selectedPackageId)) {
        setSelectedPackageId(pkgs[1]?.id || pkgs[0].id);
      }
    }
    loadPackages();
  }, [calculation.totalPeakKW]);

  const activePackage = useMemo(() => {
    return matchedPackages.find((p) => p.id === selectedPackageId) || matchedPackages[0];
  }, [matchedPackages, selectedPackageId]);

  // WhatsApp inquiry URL
  const whatsAppUrl = useMemo(() => {
    const message = buildWhatsAppSizingMessage(calculation, activePackage);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }, [calculation, activePackage]);

  // Copy sizing summary
  const handleCopySummary = () => {
    const text = `Sara Power Solution SOLAR SIZING SUMMARY:
Peak Continuous Load: ${calculation.totalPeakKW} kW (${calculation.totalPeakWatts} W)
Daily Energy Consumption: ${calculation.dailyEnergyKWh} kWh/day
Recommended Inverter: ${calculation.recommendedInverterKW} kW (${calculation.recommendedInverterKVA} kVA)
Recommended Battery Storage: ${calculation.recommendedBatteryKWh} kWh LiFePO4
Recommended Solar PV Array: ${calculation.recommendedPanelCount550W}x 550W Panels (${calculation.recommendedSolarArrayWp} Wp)
Recommended Package: ${activePackage?.name || 'Custom Setup'}
Inquiries: +251 95 483 4159 (WhatsApp)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Helper for appliance icons
  const renderApplianceIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4 text-amber-500 flex-shrink-0' };
    switch (iconName) {
      case 'Refrigerator':
        return <Refrigerator {...props} />;
      case 'Tv':
        return <Tv {...props} />;
      case 'Lightbulb':
        return <Lightbulb {...props} />;
      case 'Waves':
        return <Waves {...props} />;
      case 'Fan':
        return <Fan {...props} />;
      case 'Laptop':
        return <Laptop {...props} />;
      case 'Wifi':
        return <Wifi {...props} />;
      case 'Microwave':
        return <Flame {...props} />;
      case 'Coffee':
        return <Coffee {...props} />;
      case 'Wind':
        return <Wind {...props} />;
      default:
        return <Zap {...props} />;
    }
  };

  return (
    <div className="w-full space-y-10 print:space-y-6">
      {/* Print-only Professional Header */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-sara-red/30 pb-4 mb-4 space-y-1 text-center">
        <h1 className="text-2xl font-bold font-mono tracking-widest uppercase text-slate-900">SARA POWER SOLUTIONS PLC</h1>
        <h2 className="text-sm font-mono tracking-wider text-slate-600">OFFICIAL SOLAR SIZING REPORT</h2>
      </div>

      {/* Header & Mode Switcher Bar */}
      <div className="bg-kith-subBg border border-kith-border p-6 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-superwide uppercase text-amber-500">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>FR-2 // AUTOMATED SOLAR SIZING & RECOMMENDATION ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-kith-bone flex items-center gap-3">
            <Sun className="w-6 h-6 text-amber-500" />
            HOUSEHOLD SOLAR POWER SIZING CALCULATOR
          </h2>
          <p className="text-xs font-mono text-kith-muted max-w-2xl">
            Select your household appliances or enter direct Kilowatt (kW) power requirements to calculate inverter capacity, LiFePO4 battery storage, solar panels, and estimated costs.
          </p>
        </div>

        {/* Dual Mode Switcher Pill */}
        <div className="flex items-center bg-kith-card border border-kith-border p-1 gap-1 flex-shrink-0">
          <button
            onClick={() => setMode('appliance')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase font-bold flex items-center gap-2 transition-all ${
              mode === 'appliance'
                ? 'bg-sara-red text-white shadow-md'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Appliance Checklist</span>
          </button>
          <button
            onClick={() => setMode('direct')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase font-bold flex items-center gap-2 transition-all ${
              mode === 'direct'
                ? 'bg-sara-red text-white shadow-md'
                : 'text-kith-muted hover:text-kith-bone'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Direct kW Input</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid: Left Controls (Appliances / Sliders) + Right Live Telemetry & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 print:hidden">
          {mode === 'appliance' ? (
            /* Mode 1: Appliance Checklist */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kith-border text-xs font-mono">
                <span className="text-kith-muted uppercase tracking-widest">
                  SELECT HOUSEHOLD APPLIANCES
                </span>
                <button
                  onClick={handleReset}
                  className="text-[11px] text-kith-muted hover:text-amber-500 flex items-center gap-1 uppercase tracking-wider transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Defaults
                </button>
              </div>

              {/* Appliance Cards */}
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_APPLIANCES.map((app) => {
                  const qty = quantities[app.id] || 0;
                  const hrs = hours[app.id] || app.defaultHours;
                  const isActive = qty > 0;
                  const subtotalWatts = app.wattage * qty;
                  const subtotalDailyKWh = (subtotalWatts * hrs) / 1000;

                  return (
                    <div
                      key={app.id}
                      className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-kith-card border-kith-bone/40 shadow-sm'
                          : 'bg-kith-subBg/40 border-kith-border hover:border-kith-border/80 opacity-75'
                      }`}
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-kith-subBg border border-kith-border rounded-none mt-0.5">
                          {renderApplianceIcon(app.iconName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-mono font-bold text-kith-bone truncate">
                              {app.name}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-kith-subBg border border-kith-border text-amber-500">
                              {app.wattage}W each
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-kith-muted truncate">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quantity Controls & Hours */}
                      <div className="flex items-center gap-4 flex-shrink-0 self-end sm:self-center">
                        {/* Hours selector when active */}
                        {isActive && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-kith-muted bg-kith-subBg px-2 py-1 border border-kith-border">
                            <span>Hours/Day:</span>
                            <input
                              type="number"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={hrs}
                              onChange={(e) => handleHoursChange(app.id, parseFloat(e.target.value) || 1)}
                              className="w-10 bg-transparent text-kith-bone text-center font-bold outline-none border-b border-kith-muted focus:border-amber-500"
                            />
                            <span>h</span>
                          </div>
                        )}

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-kith-border bg-kith-subBg">
                          <button
                            onClick={() => handleQuantityChange(app.id, -1)}
                            disabled={qty === 0}
                            className="p-1.5 text-kith-muted hover:text-kith-bone disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-bold text-kith-bone">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(app.id, 1)}
                            className="p-1.5 text-kith-muted hover:text-kith-bone transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Subtotal badge */}
                        {isActive && (
                          <div className="hidden sm:block text-right min-w-[70px]">
                            <div className="text-xs font-mono font-bold text-kith-bone">
                              {subtotalWatts} W
                            </div>
                            <div className="text-[10px] font-mono text-kith-muted">
                              {subtotalDailyKWh.toFixed(1)} kWh/d
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Appliance Section */}
              {customAppliances.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-kith-muted">
                    CUSTOM ADDED APPLIANCES
                  </span>
                  {customAppliances.map((custom) => (
                    <div
                      key={custom.id}
                      className="p-3 bg-kith-card border border-kith-border flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-kith-bone">{custom.name}</span>
                        <span className="text-kith-muted ml-2">
                          ({custom.wattage}W × {custom.quantity} = {custom.wattage * custom.quantity}W for {custom.hours}h/d)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCustom(custom.id)}
                        className="text-rose-500 hover:text-rose-400 text-[11px] underline uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Appliance Button / Form */}
              {!showAddCustom ? (
                <button
                  onClick={() => setShowAddCustom(true)}
                  className="w-full py-2.5 border border-dashed border-kith-border hover:border-kith-bone text-kith-muted hover:text-kith-bone text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Appliance / Heavy Equipment
                </button>
              ) : (
                <form
                  onSubmit={handleAddCustom}
                  className="p-4 bg-kith-card border border-kith-border space-y-4 animate-in fade-in duration-200"
                >
                  <div className="text-xs font-mono font-bold uppercase text-kith-bone">
                    Add Custom Electrical Load
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono text-kith-muted uppercase block mb-1">
                        Appliance Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Laser Printer, Deep Freezer, Motor"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-2 bg-kith-subBg border border-kith-border text-xs font-mono text-kith-bone focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-kith-muted uppercase block mb-1">
                        Wattage (W)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="20000"
                        value={customWatts}
                        onChange={(e) => setCustomWatts(parseInt(e.target.value) || 100)}
                        className="w-full px-3 py-2 bg-kith-subBg border border-kith-border text-xs font-mono text-kith-bone focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-kith-muted uppercase block mb-1">
                        Daily Hours (h)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="24"
                        step="0.5"
                        value={customHrs}
                        onChange={(e) => setCustomHrs(parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-kith-subBg border border-kith-border text-xs font-mono text-kith-bone focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustom(false)}
                      className="px-4 py-2 text-xs font-mono uppercase text-kith-muted hover:text-kith-bone"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-sara-red text-white text-xs font-mono font-bold uppercase hover:bg-sara-redLight transition-colors"
                    >
                      Add Load
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Mode 2: Direct Power Input (Technical Mode) */
            <div className="p-6 bg-kith-card border border-kith-border space-y-8">
              <div className="space-y-2 border-b border-kith-border pb-4">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-500">
                  TECHNICAL CUSTOMER MODE
                </div>
                <h3 className="text-lg font-bold font-mono text-kith-bone uppercase">
                  DIRECT POWER & ENERGY SPECIFICATIONS
                </h3>
                <p className="text-xs font-mono text-kith-muted">
                  Slide or enter your exact household / business electrical peak load in Kilowatts (kW) and desired daily battery backup autonomy.
                </p>
              </div>

              {/* Slider 1: Peak Continuous Load (kW) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kith-bone font-bold uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Continuous Peak Load (kW):
                  </span>
                  <span className="text-base font-extrabold text-amber-500">
                    {directPeakKW.toFixed(1)} kW{' '}
                    <span className="text-xs text-kith-muted font-normal">
                      ({Math.round(directPeakKW * 1000)} Watts)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15.0"
                  step="0.1"
                  value={directPeakKW}
                  onChange={(e) => setDirectPeakKW(parseFloat(e.target.value))}
                  className="w-full h-2 bg-kith-subBg rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-kith-muted">
                  <span>0.5 kW (Small House)</span>
                  <span>3.5 kW (Standard Villa)</span>
                  <span>7.5 kW (Commercial / Large)</span>
                  <span>15.0 kW (Heavy Industrial)</span>
                </div>
              </div>

              {/* Slider 2: Daily Energy Demand (kWh/day) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kith-bone font-bold uppercase flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Daily Total Energy Demand (kWh / Day):
                  </span>
                  <span className="text-base font-extrabold text-amber-500">
                    {directDailyKWh.toFixed(1)} kWh / day
                  </span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="50.0"
                  step="0.5"
                  value={directDailyKWh}
                  onChange={(e) => setDirectDailyKWh(parseFloat(e.target.value))}
                  className="w-full h-2 bg-kith-subBg rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-kith-muted">
                  <span>2 kWh/d</span>
                  <span>12 kWh/d (Average)</span>
                  <span>25 kWh/d (High Demand)</span>
                  <span>50 kWh/d</span>
                </div>
              </div>

              {/* Slider 3: Desired Battery Backup / Autonomy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-kith-bone font-bold uppercase flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    Battery Backup Duration (Hours):
                  </span>
                  <span className="text-base font-extrabold text-emerald-500">
                    {autonomyHours} Hours{' '}
                    <span className="text-xs text-kith-muted font-normal">
                      ({autonomyHours === 24 ? 'Full 24/7 Off-Grid' : 'Nighttime Backup'})
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 12, 18, 24].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setAutonomyHours(hrs)}
                      className={`py-2 text-xs font-mono uppercase tracking-wider font-bold border transition-colors ${
                        autonomyHours === hrs
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-kith-subBg border-kith-border text-kith-muted hover:text-kith-bone'
                      }`}
                    >
                      {hrs} Hours
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Autonomy Hours Selector for Appliance Mode too */}
          {mode === 'appliance' && (
            <div className="p-4 bg-kith-card border border-kith-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-mono">
                <span className="text-kith-bone font-bold uppercase block">
                  Desired Battery Backup Duration:
                </span>
                <span className="text-[11px] text-kith-muted">
                  Hours of energy needed from battery when solar sun is unavailable.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[8, 12, 16, 24].map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() => setAutonomyHours(hrs)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase font-bold border transition-all ${
                      autonomyHours === hrs
                        ? 'bg-amber-500 text-black border-amber-500 font-extrabold'
                        : 'bg-kith-subBg border-kith-border text-kith-muted hover:text-kith-bone'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Technical Telemetry & Recommendations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 print:col-span-12">
          {/* Live System Sizing Telemetry Box */}
          <div className="bg-kith-subBg border border-kith-border p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-kith-border pb-3">
              <div className="text-xs font-mono uppercase tracking-widest text-kith-bone font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                SYSTEM SIZING OUTPUT
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase">
                CALIBRATED FOR ETHIOPIA
              </span>
            </div>

            {/* 4 Big Spec Dials */}
            <div className="grid grid-cols-2 gap-4">
              {/* Dial 1: Peak kW */}
              <div className="p-4 bg-kith-card border border-kith-border space-y-1">
                <span className="text-[10px] font-mono text-kith-muted uppercase tracking-wider block">
                  Continuous Load
                </span>
                <div className="text-2xl font-black text-kith-bone font-mono">
                  {calculation.totalPeakKW}{' '}
                  <span className="text-xs font-bold text-amber-500">kW</span>
                </div>
                <div className="text-[10px] font-mono text-kith-muted">
                  {calculation.totalPeakWatts} Watts peak surge
                </div>
              </div>

              {/* Dial 2: Daily kWh */}
              <div className="p-4 bg-kith-card border border-kith-border space-y-1">
                <span className="text-[10px] font-mono text-kith-muted uppercase tracking-wider block">
                  Daily Energy
                </span>
                <div className="text-2xl font-black text-kith-bone font-mono">
                  {calculation.dailyEnergyKWh}{' '}
                  <span className="text-xs font-bold text-amber-500">kWh/d</span>
                </div>
                <div className="text-[10px] font-mono text-kith-muted">
                  {(calculation.dailyEnergyWattHours / 1000).toFixed(1)} Units/day
                </div>
              </div>

              {/* Dial 3: Inverter Size */}
              <div className="p-4 bg-kith-card border border-kith-border space-y-1">
                <span className="text-[10px] font-mono text-kith-muted uppercase tracking-wider block">
                  Required Inverter
                </span>
                <div className="text-2xl font-black text-kith-bone font-mono">
                  {calculation.recommendedInverterKW}{' '}
                  <span className="text-xs font-bold text-sky-400">kW</span>
                </div>
                <div className="text-[10px] font-mono text-kith-muted">
                  {calculation.recommendedInverterKVA} kVA Pure Sine Wave
                </div>
              </div>

              {/* Dial 4: Battery Storage */}
              <div className="p-4 bg-kith-card border border-kith-border space-y-1">
                <span className="text-[10px] font-mono text-kith-muted uppercase tracking-wider block">
                  LiFePO4 Storage
                </span>
                <div className="text-2xl font-black text-kith-bone font-mono">
                  {calculation.recommendedBatteryKWh}{' '}
                  <span className="text-xs font-bold text-emerald-400">kWh</span>
                </div>
                <div className="text-[10px] font-mono text-kith-muted">
                  ~{calculation.recommendedBatteryAh48V}Ah at 48V Bank
                </div>
              </div>
            </div>

            {/* Solar Array Breakdown Bar */}
            <div className="p-4 bg-kith-card border border-kith-border space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-kith-bone font-bold uppercase flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Recommended Solar PV Array:
                </span>
                <span className="text-sm font-extrabold text-amber-500 font-mono">
                  {calculation.recommendedSolarArrayWp} Wp
                </span>
              </div>
              <p className="text-xs font-mono text-kith-muted">
                Requires <b>{calculation.recommendedPanelCount550W}x 550W Tier-1 N-Type Monocrystalline Panels</b> to fully recharge batteries and power your home during daytime hours.
              </p>
            </div>

            {/* Environmental & Diesel Savings Summary */}
            <div className="p-4 bg-kith-card/50 border border-kith-border space-y-2 text-xs font-mono">
              <div className="text-[10px] text-kith-muted uppercase tracking-widest font-bold">
                ESTIMATED FUEL & GRID SAVINGS
              </div>
              <div className="flex items-center justify-between">
                <span className="text-kith-muted">Annual Clean CO₂ Reduction:</span>
                <span className="font-bold text-kith-bone">
                  {calculation.annualCO2ReductionKg.toLocaleString()} kg / Year
                </span>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="space-y-3 pt-2 print:hidden">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>INQUIRE SIZING VIA WHATSAPP</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="flex-1 py-2 bg-kith-card border border-kith-border hover:border-kith-bone text-kith-bone text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Sizing!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-kith-muted" />
                      <span>Copy Sizing</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-kith-card border border-kith-border hover:border-kith-bone text-kith-bone text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-kith-muted" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Solar Packages Cards (3 Tiers: Economy / Recommended / Premium) */}
      <div className="space-y-6 pt-6 border-t border-kith-border">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono tracking-superwide text-kith-muted uppercase">
              RECOMMENDATION ENGINE RESULTS
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-kith-bone">
              MATCHED SOLAR SYSTEM PACKAGES & KITS
            </h3>
          </div>
          <p className="text-xs font-mono text-kith-muted">
            All kits include full Tier-1 warranty, MPPT charge controller, DC breaker protections, and cabling.
          </p>
        </div>

        {/* 3 Columns Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matchedPackages.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const attr = pkg.solar_attributes?.[0];
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`cursor-pointer p-6 border transition-all relative flex flex-col justify-between space-y-6 ${
                  pkg.is_featured
                    ? 'bg-kith-card border-amber-500/80 ring-1 ring-amber-500/30'
                    : isSelected
                    ? 'bg-kith-card border-kith-bone'
                    : 'bg-kith-subBg border-kith-border hover:border-kith-border/90'
                }`}
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 right-6 bg-amber-500 text-black text-[10px] font-mono font-extrabold px-3 py-0.5 uppercase tracking-widest shadow-md">
                    ★ MOST POPULAR FIT
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-kith-muted block">
                      Matched for {attr?.min_kw_load} - {attr?.max_kw_load} kW Load
                    </span>
                    <h4 className="text-lg font-bold font-mono text-kith-bone uppercase mt-1">
                      {pkg.name}
                    </h4>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 pb-3 border-y border-kith-border">
                    <span className="text-sm font-bold text-amber-500 uppercase flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Inquire for Custom Quote
                    </span>
                  </div>

                  {/* Component Breakdown */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-kith-muted text-[11px] block">Inverter:</span>
                        <span className="font-bold text-kith-bone">{attr?.inverter_kva || 'N/A'} kVA Hybrid Inverter</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Battery className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-kith-muted text-[11px] block">Battery Storage:</span>
                        <span className="font-bold text-kith-bone">{attr?.battery_capacity_kwh || 'N/A'} kWh Storage</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-kith-muted text-[11px] block">Solar PV Array:</span>
                        <span className="font-bold text-kith-bone">{attr?.wattage_wp || 'N/A'} Wp Solar Array</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="pt-2 space-y-1.5 text-[11px] font-mono text-kith-muted">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-3">{pkg.description}</span>
                    </div>
                  </div>
                </div>

                {/* Package Card Bottom CTA */}
                <div className="pt-4 border-t border-kith-border">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppSizingMessage(
                      calculation,
                      pkg
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 text-xs font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${
                      pkg.is_featured
                        ? 'bg-sara-red text-white hover:bg-sara-redLight shadow-md'
                        : 'bg-sara-red text-white hover:bg-sara-redLight'
                    }`}
                  >
                    <span>ORDER THIS KIT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Sizing FAQ & Notes */}
      <div className="p-6 bg-kith-subBg border border-kith-border space-y-4 text-xs font-mono">
        <h4 className="text-sm font-bold uppercase text-kith-bone flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          TECHNICAL SIZING ASSUMPTIONS & DESIGN NOTES
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-kith-muted leading-relaxed">
          <div>
            <strong className="text-kith-bone">Solar Irradiance:</strong> Sized for Addis Ababa and regional Ethiopian sun hours averaging 5.2 peak sun hours daily, factoring seasonal overcast variations.
          </div>
          <div>
            <strong className="text-kith-bone">Battery Longevity:</strong> We recommend Lithium Iron Phosphate (LiFePO4) over lead-acid due to its 6,000+ deep cycles, 85% usable DOD, and 10+ year lifespan.
          </div>
          <div>
            <strong className="text-kith-bone">Inverter Surge Capacity:</strong> Continuous loads are multiplied by a 1.25× engineering safety margin to absorb motor starting inrush currents (water pumps, fridge compressors).
          </div>
          <div>
            <strong className="text-kith-bone">Custom Engineering:</strong> Need three-phase 380V power or industrial grid-tied solar? Contact Sara Power Solution engineering directly at <b className="text-kith-bone">{PRIMARY_PHONE}</b>.
          </div>
        </div>
      </div>
    </div>
  );
};
