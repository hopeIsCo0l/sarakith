'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-0.5 bg-kith-subBg border border-sara-red/30 rounded-sm ${className}`}>
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              aria-label={`Switch to ${opt.label} theme`}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-all rounded-sm min-h-[36px] ${
                isActive
                  ? 'bg-sara-red text-white font-bold shadow-sm'
                  : 'text-kith-muted hover:text-sara-red dark:hover:text-red-400'
              }`}
              title={`Switch to ${opt.label} theme`}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Current theme: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}. Click to toggle theme.`}
        className="flex items-center gap-2 px-3 py-2 min-h-[38px] text-xs font-mono font-bold tracking-widest uppercase bg-kith-subBg text-sara-red dark:text-red-400 border border-sara-red/30 hover:border-sara-red/60 hover:bg-sara-red/10 transition-all rounded-sm shadow-sm"
        title="Toggle Theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-red-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="text-[11px] hidden sm:inline">
          {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-kith-card border border-sara-red/40 shadow-2xl backdrop-blur-md z-50 py-1 rounded-sm animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-kith-muted border-b border-sara-red/20 mb-1">
            Display Mode
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                aria-label={`Select ${opt.label} theme`}
                className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[40px] text-xs font-mono tracking-wider uppercase text-left transition-colors ${
                  isSelected
                    ? 'bg-sara-red/15 text-sara-red dark:text-red-400 font-bold'
                    : 'text-kith-muted hover:bg-sara-red/10 hover:text-sara-red dark:hover:text-red-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-sara-red dark:text-red-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
