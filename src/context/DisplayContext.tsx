import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContentSchedule {
  id: string;
  name: string;
  type: "main" | "announcement" | "runningText";
  contentType?: "video" | "slider";
  content: string | string[];
  startTime: string;
  endTime: string;
  days: number[];
  isActive: boolean;
}

export interface ScheduleItem {
  kelas: string;
  pelajaran: string;
  startTime: string;
  endTime: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  rombel: string | null;
  start_time: string;
  end_time: string;
  period: string | null;
  subject_name: string | null;
  description: string | null;
  mode: 'KBM' | 'RAMADHAN' | 'PAS_PAT';
}

export interface DisplaySettings {
  id: string;
  active_mode: 'KBM' | 'RAMADHAN' | 'PAS_PAT';
  note_apel_pagi: string;
  note_apel_bersama: string;
  note_istirahat: string;
  note_pulang: string;
}

export interface TimeStatus {
  activePeriod: TimetableEntry | null;
  nextPeriod: TimetableEntry | null;
  countdown: string;
  targetLabel: string;
}

export interface DisplayConfig {
  contentType: "video" | "slider";
  videoUrl: string;
  sliderImages: string[];
  announcementPosters: string[];
  jadwalPelajaran: ScheduleItem[]; // Legacy
  dalilHariIni: string;
  runningText: string;
  runningTextSpeed: number;
  announcementInterval: number;
  prayerLocation: string;
  headerTitle: string;
  schedules: ContentSchedule[];
}

interface DisplayContextType {
  config: DisplayConfig;
  updateConfig: (updates: Partial<DisplayConfig>) => void;
  isLoading: boolean;
  saveToCloud: () => Promise<void>;
  isSaving: boolean;
  status: TimeStatus;
  // New Master Timetable System
  timetable: TimetableEntry[];
  settings: DisplaySettings;
  updateSettings: (updates: Partial<DisplaySettings>) => void;
  saveSettings: () => Promise<void>;
}

const defaultSettings: DisplaySettings = {
  id: "",
  active_mode: 'KBM',
  note_apel_pagi: 'Berbaris Di Depan Kelas Masing-Masing',
  note_apel_bersama: 'Seragam Lengkap, Berbaris Rapi',
  note_istirahat: 'Shalat Dhuha, Tetap Tertib, Jaga Kebersihan',
  note_pulang: 'Shalat Dzuhur Berjamaah, Tetap Jaga Ketertiban'
};

const defaultConfig: DisplayConfig = {
  contentType: "slider",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  sliderImages: [
    "https://images.unsplash.com/photo-1585036156171-384164a8c21e?w=800&q=80",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
    "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
  ],
  announcementPosters: [
    "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=400&q=80",
  ],
  jadwalPelajaran: [],
  dalilHariIni:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim)',
  runningText:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim) | Pendaftaran Santri Baru TA 2026/2027 dibuka! | Kegiatan Pesantren Kilat Ramadhan 1447H',
  runningTextSpeed: 30,
  announcementInterval: 5,
  prayerLocation: "Pandeglang, Banten",
  headerTitle: "SMART DIGITAL INFORMATION SYSTEM",
  schedules: [],
};

const DisplayContext = createContext<DisplayContextType | undefined>(undefined);

export const DisplayProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DisplayConfig>(defaultConfig);
  const [configRecordId, setConfigRecordId] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<TimeStatus>({
    activePeriod: null,
    nextPeriod: null,
    countdown: "00:00:00",
    targetLabel: "MENUNGGU JADWAL",
  });
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  const loadData = async () => {
    try {
      // 1. Fetch Config
      const { data: configData, error: configError } = await (supabase as any)
        .from("display_config")
        .select("id, config_data")
        .eq("config_key", "default")
        .maybeSingle();

      if (configError) throw configError;

      if (configData) {
        setConfigRecordId(configData.id);
        if (configData.config_data) {
          setConfig({
            ...defaultConfig,
            ...(configData.config_data as unknown as Partial<DisplayConfig>),
          });
        }
      }
// ... (rest of loadData)
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrayerTimes = async () => {
// ... (rest of fetchPrayerTimes)
  };

  // Load data on mount
  useEffect(() => {
// ... (rest of useEffect)
  }, []);

  // Update status based on current time
  useEffect(() => {
// ... (rest of status update)
  }, [timetable, settings.active_mode]);

  const updateConfig = useCallback((updates: Partial<DisplayConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSettings = useCallback((updates: Partial<DisplaySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveToCloud = useCallback(async () => {
    setIsSaving(true);
    try {
      const configToSave = JSON.parse(JSON.stringify(config));
      const { error } = await (supabase as any).from("display_config").upsert({ 
        config_key: "default", 
        config_data: configToSave,
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });

      if (error) throw error;
    } catch (e) {
      console.error("Failed to save config:", e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      await (supabase as any).from("display_settings").upsert({
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (e) {
      console.error("Failed to save settings:", e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  return (
    <DisplayContext.Provider value={{ 
      config, updateConfig, isLoading, saveToCloud, isSaving, status,
      timetable, settings, updateSettings, saveSettings 
    }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = () => {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
};
