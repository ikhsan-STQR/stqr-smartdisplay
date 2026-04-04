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
  headerTitle: string; // Legacy
  header_subtitle: string;
  organization_name: string;
  organization_logo: string;
  primary_color: string;
  secondary_color: string;
  text_color_main: string;
  clock_bg_color: string;
  clock_text_color: string;
  running_text_bg: string;
  running_text_color: string;
  
  // Granular Zone Colors
  header_bg: string;
  header_title_color: string;
  header_subtitle_color: string;
  top_clock_bg: string;
  top_clock_text: string;
  left_title_bg: string;
  left_title_text: string;
  left_content_text: string;
  left_countdown_bg: string;
  left_countdown_text: string;
  right_title_bg: string;
  right_title_text: string;
  footer_bg: string;
  footer_text_color: string;
  prayer_box_bg: string;
  prayer_box_text: string;
  prayer_highlight_text: string;
  left_wrapper_bg: string;
  marquee_wrapper_bg: string;

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
  header_subtitle: "SMART DIGITAL INFORMATION SYSTEM",
  organization_name: "STQ Riyadhussholihiin",
  organization_logo: "",
  primary_color: "#8b7336",
  secondary_color: "#A8E6CF",
  text_color_main: "#1a3a3a",
  clock_bg_color: "#8b7336",
  clock_text_color: "#ffffff",
  running_text_bg: "#A8E6CF",
  running_text_color: "#133c47",

  // Granular Defaults
  header_bg: "transparent",
  header_title_color: "#1a3a3a",
  header_subtitle_color: "#9e8549",
  top_clock_bg: "#8b7336",
  top_clock_text: "#ffffff",
  left_title_bg: "#1a3a3a",
  left_title_text: "#ffffff",
  left_content_text: "#1a3a3a",
  left_countdown_bg: "#ffffff",
  left_countdown_text: "#8b7336",
  right_title_bg: "#A8E6CF",
  right_title_text: "#133c47",
  footer_bg: "transparent",
  footer_text_color: "#ffffff",
  prayer_box_bg: "#1a3a3a",
  prayer_box_text: "#133c47",
  prayer_highlight_text: "#facc15",
  left_wrapper_bg: "transparent",
  marquee_wrapper_bg: "#133c47",

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
      // 1. Fetch Config - Use "*" to be more resilient to schema changes/cache
      const { data: configData, error: configError } = await (supabase as any)
        .from("display_config")
        .select("*")
        .eq("config_key", "default")
        .maybeSingle();

      if (configError) {
        console.error("Supabase Config Fetch Error:", configError);
        // Fallback to default if table exists but column is missing in cache
      }

      if (configData) {
        // Safe mapping - only update if data exists in the DB response
        const newUpdates: Partial<DisplayConfig> = {};
        
        if (configData.config_data) {
          Object.assign(newUpdates, configData.config_data);
        }
        
        // Identity columns (Handle if columns were recently added/removed)
        if (configData.organization_name !== undefined) newUpdates.organization_name = configData.organization_name;
        if (configData.organization_logo !== undefined) newUpdates.organization_logo = configData.organization_logo;
        if (configData.header_subtitle !== undefined) newUpdates.header_subtitle = configData.header_subtitle;
        if (configData.primary_color !== undefined) newUpdates.primary_color = configData.primary_color;
        if (configData.secondary_color !== undefined) newUpdates.secondary_color = configData.secondary_color;
        if (configData.text_color_main !== undefined) newUpdates.text_color_main = configData.text_color_main;
        if (configData.clock_bg_color !== undefined) newUpdates.clock_bg_color = configData.clock_bg_color;
        if (configData.clock_text_color !== undefined) newUpdates.clock_text_color = configData.clock_text_color;
        if (configData.running_text_bg !== undefined) newUpdates.running_text_bg = configData.running_text_bg;
        if (configData.running_text_color !== undefined) newUpdates.running_text_color = configData.running_text_color;
        
        // Granular Mapping
        if (configData.header_bg !== undefined) newUpdates.header_bg = configData.header_bg;
        if (configData.header_title_color !== undefined) newUpdates.header_title_color = configData.header_title_color;
        if (configData.header_subtitle_color !== undefined) newUpdates.header_subtitle_color = configData.header_subtitle_color;
        if (configData.top_clock_bg !== undefined) newUpdates.top_clock_bg = configData.top_clock_bg;
        if (configData.top_clock_text !== undefined) newUpdates.top_clock_text = configData.top_clock_text;
        if (configData.left_title_bg !== undefined) newUpdates.left_title_bg = configData.left_title_bg;
        if (configData.left_title_text !== undefined) newUpdates.left_title_text = configData.left_title_text;
        if (configData.left_content_text !== undefined) newUpdates.left_content_text = configData.left_content_text;
        if (configData.left_countdown_bg !== undefined) newUpdates.left_countdown_bg = configData.left_countdown_bg;
        if (configData.left_countdown_text !== undefined) newUpdates.left_countdown_text = configData.left_countdown_text;
        if (configData.right_title_bg !== undefined) newUpdates.right_title_bg = configData.right_title_bg;
        if (configData.right_title_text !== undefined) newUpdates.right_title_text = configData.right_title_text;
        if (configData.footer_bg !== undefined) newUpdates.footer_bg = configData.footer_bg;
        if (configData.footer_text_color !== undefined) newUpdates.footer_text_color = configData.footer_text_color;
        if (configData.prayer_box_bg !== undefined) newUpdates.prayer_box_bg = configData.prayer_box_bg;
        if (configData.prayer_box_text !== undefined) newUpdates.prayer_box_text = configData.prayer_box_text;
        if (configData.prayer_highlight_text !== undefined) newUpdates.prayer_highlight_text = configData.prayer_highlight_text;
        if (configData.left_wrapper_bg !== undefined) newUpdates.left_wrapper_bg = configData.left_wrapper_bg;
        if (configData.marquee_wrapper_bg !== undefined) newUpdates.marquee_wrapper_bg = configData.marquee_wrapper_bg;

        setConfig(prev => ({
          ...defaultConfig,
          ...newUpdates
        }));
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
    let mounted = true;
    loadData();
    const prayerInterval = setInterval(fetchPrayerTimes, 3600000); // Update once an hour
    
    // Real-time Subscriptions
    const configChannel = supabase
      .channel('display-config-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_config', filter: 'config_key=eq.default' }, (payload) => {
        if (mounted && payload.new && (payload.new as any).config_data) {
          setConfig(prev => ({ ...prev, ...((payload.new as any).config_data as any) }));
        }
      }).subscribe();

    const settingsChannel = supabase
      .channel('display-settings-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'display_settings' }, (payload) => {
        if (mounted && payload.new) setSettings(payload.new as DisplaySettings);
      }).subscribe();

    const timetableChannel = supabase
      .channel('timetable-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetables' }, () => {
        // Refresh full timetable on any major change
        if (mounted) {
          (supabase as any).from("timetables").select("*").then(({ data }: any) => {
            if (mounted && data) setTimetable(data as unknown as TimetableEntry[]);
          });
        }
      }).subscribe();

    return () => {
      mounted = false;
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
        organization_name: config.organization_name,
        organization_logo: config.organization_logo,
        header_subtitle: config.header_subtitle,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        text_color_main: config.text_color_main,
        clock_bg_color: config.clock_bg_color,
        clock_text_color: config.clock_text_color,
        running_text_bg: config.running_text_bg,
        running_text_color: config.running_text_color,
        header_bg: config.header_bg,
        header_title_color: config.header_title_color,
        header_subtitle_color: config.header_subtitle_color,
        top_clock_bg: config.top_clock_bg,
        top_clock_text: config.top_clock_text,
        left_title_bg: config.left_title_bg,
        left_title_text: config.left_title_text,
        left_content_text: config.left_content_text,
        left_countdown_bg: config.left_countdown_bg,
        left_countdown_text: config.left_countdown_text,
        right_title_bg: config.right_title_bg,
        right_title_text: config.right_title_text,
        footer_bg: config.footer_bg,
        footer_text_color: config.footer_text_color,
        prayer_box_bg: config.prayer_box_bg,
        prayer_box_text: config.prayer_box_text,
        prayer_highlight_text: config.prayer_highlight_text,
        left_wrapper_bg: config.left_wrapper_bg,
        marquee_wrapper_bg: config.marquee_wrapper_bg,
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
