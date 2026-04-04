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
  dalilHariIni: '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim)',
  runningText: '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim) | Pendaftaran Santri Baru TA 2026/2027 dibuka! | Kegiatan Pesantren Kilat Ramadhan 1447H',
  runningTextSpeed: 30,
  announcementInterval: 5,
  prayerLocation: "Pandeglang, Banten",
  headerTitle: "SMART DIGITAL INFORMATION SYSTEM",
  schedules: [],
};

const DisplayContext = createContext<DisplayContextType | undefined>(undefined);

export const DisplayProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DisplayConfig>(defaultConfig);
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
    // Safety Timeout: Force stop loading after 10s
    const timeoutId = setTimeout(() => {
      console.warn("DisplayContext: Data loading timed out. Enabling dashboard with current state.");
      setIsLoading(false);
    }, 10000);

    try {
      // 1. Fetch Config
      const { data: configData } = await (supabase as any)
        .from("display_config")
        .select("config_data")
        .eq("config_key", "default")
        .maybeSingle();

      if (configData?.config_data) {
        setConfig({
          ...defaultConfig,
          ...(configData.config_data as unknown as Partial<DisplayConfig>),
        });
      }

      // 2. Fetch Display Settings (Global Mode & Notes)
      const { data: settingsData } = await (supabase as any)
        .from("display_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        setSettings(settingsData as DisplaySettings);
      }

      // 3. Fetch Timetable
      const { data: timetableData } = await (supabase as any)
        .from("timetables")
        .select("*");

      if (timetableData) {
        setTimetable(timetableData as TimetableEntry[]);
      }

      // 4. Fetch Prayer Times
      fetchPrayerTimes();
    } catch (e) {
      console.error("Error loading display data:", e);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=Pandeglang&country=Indonesia&method=11`
      );
      const data = await response.json();
      if (data.code === 200) {
        setPrayerTimes(data.data.timings);
      }
    } catch (e) {
      console.error("Failed to fetch prayer times:", e);
    }
  };

  useEffect(() => {
    loadData();
    const prayerInterval = setInterval(fetchPrayerTimes, 3600000);
    
    const configChannel = supabase
      .channel('display-config-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_config', filter: 'config_key=eq.default' }, (payload) => {
        if (payload.new && (payload.new as any).config_data) {
          setConfig(prev => ({ ...prev, ...((payload.new as any).config_data as any) }));
        }
      }).subscribe();

    const settingsChannel = supabase
      .channel('display-settings-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_settings' }, (payload) => {
        if (payload.new) setSettings(payload.new as DisplaySettings);
      }).subscribe();

    const timetableChannel = supabase
      .channel('timetable-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetables' }, () => {
        (supabase as any).from("timetables").select("*").then(({ data }: any) => {
          if (data) setTimetable(data as TimetableEntry[]);
        });
      }).subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(timetableChannel);
      clearInterval(prayerInterval);
    };
  }, []);

  useEffect(() => {
    const updateTimeStatus = () => {
      const now = new Date();
      const jakartaDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      const jakartaDate = new Date(jakartaDateStr);
      const dayNum = now.getDay();
      
      const enDay = new Intl.DateTimeFormat("en-US", { weekday: 'long', timeZone: "Asia/Jakarta" }).format(now);
      const dayMap: { [key: string]: string } = {
        'Sunday': 'Ahad', 'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
        'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu'
      };
      const currentDayID = dayMap[enDay] || 'Senin';

      const hh = jakartaDate.getHours().toString().padStart(2, '0');
      const mm = jakartaDate.getMinutes().toString().padStart(2, '0');
      const currentTimeHM = `${hh}:${mm}`;
      
      const modeTimetable = timetable.filter(entry => entry.mode === settings.active_mode);
      const todaySorted = modeTimetable
        .filter(entry => entry.day === currentDayID)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      const active = todaySorted.find(entry => {
        const start = entry.start_time.substring(0, 5);
        const end = entry.end_time.substring(0, 5);
        return currentTimeHM >= start && currentTimeHM < end;
      }) || null;

      let next: TimetableEntry | null = null;
      let nextDate = new Date(jakartaDateStr);
      let label = "-";

      if (dayNum === 5 || dayNum === 6) {
        label = "JAM MASUK SEKOLAH";
        const daysToSun = (7 - dayNum) % 7;
        nextDate.setDate(jakartaDate.getDate() + daysToSun);
        nextDate.setHours(7, 30, 0, 0);
      } else {
        const futureToday = todaySorted.filter(e => e.start_time.substring(0, 5) > currentTimeHM);
        if (futureToday.length > 0) {
          next = futureToday[0];
          const [h, m] = next.start_time.split(':').map(Number);
          nextDate.setHours(h, m, 0, 0);
          const isFirst = next.id === todaySorted[0].id;
          const isLast = next.id === todaySorted[todaySorted.length-1].id;
          const sub = (next.subject_name || "").toUpperCase();
          const per = (next.period || "").toUpperCase();
          if (isFirst) label = "JAM MASUK SEKOLAH";
          else if (sub.includes("ISTIRAHAT")) label = "JAM ISTIRAHAT";
          else if (isLast) label = "JAM PULANG SEKOLAH";
          else if (per.includes("JP")) label = per;
          else label = sub || "KEGIATAN BERIKUTNYA";
        } else {
          label = "SHALAT DZUHUR";
          if (prayerTimes?.Dhuhr) {
            const [h, m] = prayerTimes.Dhuhr.split(':').map(Number);
            nextDate.setHours(h, m, 0, 0);
            if (nextDate < jakartaDate) nextDate.setDate(jakartaDate.getDate() + 1);
          } else {
            nextDate.setHours(12, 0, 0, 0);
            if (nextDate < jakartaDate) nextDate.setDate(jakartaDate.getDate() + 1);
          }
        }
      }

      let countdownStr = "00:00:00";
      const diffMs = nextDate.getTime() - jakartaDate.getTime();
      if (diffMs > 0) {
        const totalSeconds = Math.floor(diffMs / 1000);
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        countdownStr = `${h}:${m}:${s}`;
      }

      setStatus({
        activePeriod: active ? { ...active } : null,
        nextPeriod: next ? { ...next } : null,
        countdown: countdownStr,
        targetLabel: label,
      });
    };

    const timer = setInterval(updateTimeStatus, 1000);
    updateTimeStatus();
    return () => clearInterval(timer);
  }, [timetable, settings.active_mode, prayerTimes]);

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
