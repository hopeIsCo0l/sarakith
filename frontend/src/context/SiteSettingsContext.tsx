'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings, DEFAULT_SITE_SETTINGS, supabase } from '@/lib/supabase';
import { SiteSetting } from '@/lib/types';

interface SiteSettingsContextType {
  settings: Record<string, SiteSetting>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getSettingUrl: (key: string, fallback?: string) => string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS as Record<string, SiteSetting>,
  loading: true,
  refreshSettings: async () => {},
  getSettingUrl: () => '',
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, SiteSetting>>(
    DEFAULT_SITE_SETTINGS as Record<string, SiteSetting>
  );
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await getSiteSettings();
      setSettings(data as Record<string, SiteSetting>);
    } catch (err) {
      console.warn('Failed to load site settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Listen to window custom broadcast event
    const handleBroadcast = () => fetchSettings();
    window.addEventListener('sara_data_updated', handleBroadcast);
    window.addEventListener('focus', handleBroadcast);

    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('site_settings_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_settings' },
          () => {
            fetchSettings();
          }
        )
        .subscribe();
    }

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('sara_power_sync');
      broadcastChannel.onmessage = () => fetchSettings();
    }

    return () => {
      window.removeEventListener('sara_data_updated', handleBroadcast);
      window.removeEventListener('focus', handleBroadcast);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const getSettingUrl = (key: string, fallback: string = '/logo.png'): string => {
    if (settings[key] && settings[key].url) {
      return settings[key].url;
    }
    return fallback;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        getSettingUrl,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
