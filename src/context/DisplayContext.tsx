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

export interface TimeBlock {
  id: string;
  name: string;
  mode: 'KBM' | 'RAMADHAN' | 'PAS_PAT';
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  type: 'class' | 'break' | 'end';
}

export interface CustomTexts {
  noActivityText: string;
  breakTitle: string;
  breakNotes: string;
  apelBersamaNotes: string;
  apelPagiNotes: string;
  pulangNotes: string;
}

export interface TimeStatus {
  activePeriod: TimeBlock | null;
  nextPeriod: TimeBlock | null;
  countdown: string;
}

export interface DisplayConfig {
  contentType: "video" | "slider";
  videoUrl: string;
  sliderImages: string[];
  announcementPosters: string[];
  jadwalPelajaran: ScheduleItem[];
  dalilHariIni: string;
  runningText: string;
  runningTextSpeed: number;
  announcementInterval: number;
  prayerLocation: string;
  headerTitle: string;
  schedules: ContentSchedule[];
  timetable: TimeBlock[]; // Legacy - keeping for compat or migrating
  activeScheduleMode: 'KBM' | 'RAMADHAN' | 'PAS_PAT';
  masterTimetable: TimeBlock[];
  customTexts: CustomTexts;
}

interface DisplayContextType {
  config: DisplayConfig;
  updateConfig: (updates: Partial<DisplayConfig>) => void;
  isLoading: boolean;
  saveToCloud: () => Promise<void>;
  isSaving: boolean;
  status: TimeStatus;
}

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
  jadwalPelajaran: [
    { kelas: "I-A", pelajaran: "TEMATIK", startTime: "07:00", endTime: "08:00" },
    { kelas: "I-B", pelajaran: "CALISTUNG", startTime: "07:00", endTime: "08:00" },
    { kelas: "I-C", pelajaran: "CALISTUNG", startTime: "07:00", endTime: "08:00" },
    { kelas: "II-A", pelajaran: "P A I", startTime: "08:00", endTime: "09:00" },
    { kelas: "II-B", pelajaran: "CALISTUNG", startTime: "08:00", endTime: "09:00" },
    { kelas: "II-C", pelajaran: "TEMATIK", startTime: "08:00", endTime: "09:00" },
    { kelas: "III-A", pelajaran: "B. INGGRIS", startTime: "09:00", endTime: "10:00" },
    { kelas: "III-B", pelajaran: "PAI", startTime: "09:00", endTime: "10:00" },
    { kelas: "IV-A", pelajaran: "TEMATIK", startTime: "10:00", endTime: "11:00" },
    { kelas: "IV-B", pelajaran: "PAI", startTime: "10:00", endTime: "11:00" },
    { kelas: "V-A", pelajaran: "ADAB & AKHLAK", startTime: "13:00", endTime: "14:00" },
    { kelas: "V-B", pelajaran: "ADAB & AKHLAK", startTime: "13:00", endTime: "14:00" },
    { kelas: "VI-A", pelajaran: "B. INGGRIS", startTime: "14:00", endTime: "15:00" },
    { kelas: "VI-B", pelajaran: "PAI", startTime: "14:00", endTime: "15:00" },
    { kelas: "VII-A", pelajaran: "TAHFIDZ", startTime: "15:00", endTime: "17:00" },
    { kelas: "VII-B", pelajaran: "TAHFIDZ", startTime: "15:00", endTime: "17:00" },
    { kelas: "VIII-A", pelajaran: "FIQIH", startTime: "16:00", endTime: "17:30" },
  ],
  dalilHariIni:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim)',
  runningText:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim) | Pendaftaran Santri Baru TA 2026/2027 dibuka! | Kegiatan Pesantren Kilat Ramadhan 1447H',
  runningTextSpeed: 30,
  announcementInterval: 5,
  prayerLocation: "Pandeglang, Banten",
  headerTitle: "SMART DIGITAL INFORMATION SYSTEM",
  schedules: [],
  timetable: [
    { id: "1", name: "JP 1", mode: 'KBM', dayOfWeek: 1, startTime: "07:30", endTime: "08:10", type: 'class' },
    { id: "2", name: "JP 2", mode: 'KBM', dayOfWeek: 1, startTime: "08:10", endTime: "08:50", type: 'class' },
    { id: "3", name: "ISTIRAHAT", mode: 'KBM', dayOfWeek: 1, startTime: "08:50", endTime: "09:10", type: 'break' },
    { id: "4", name: "JP 3", mode: 'KBM', dayOfWeek: 1, startTime: "09:10", endTime: "09:50", type: 'class' },
    { id: "5", name: "JP 4", mode: 'KBM', dayOfWeek: 1, startTime: "09:50", endTime: "10:30", type: 'class' },
    { id: "6", name: "ISTIRAHAT", mode: 'KBM', dayOfWeek: 1, startTime: "10:30", endTime: "10:50", type: 'break' },
    { id: "7", name: "JP 5", mode: 'KBM', dayOfWeek: 1, startTime: "10:50", endTime: "11:30", type: 'class' },
    { id: "8", name: "JP 6", mode: 'KBM', dayOfWeek: 1, startTime: "11:30", endTime: "12:10", type: 'class' },
  ],
  activeScheduleMode: 'KBM',
  masterTimetable: [],
  customTexts: {
    noActivityText: "TIDAK ADA KEGIATAN",
    breakTitle: "Jam Istirahat",
    breakNotes: "Shalat Dhuha\nTetap Tertib\nJaga Kebersihan",
    apelBersamaNotes: "Seragam Lengkap\nBerbaris Rapi\nTidak Berisik",
    apelPagiNotes: "Berbaris Di Depan Kelas\nMasing-Masing\nBaca Doa & Hadits",
    pulangNotes: "Shalat DzhuHUR Berjamaah\nTetap Jaga Ketertiban\nJaga Kebersihan"
  }
};

const DisplayContext = createContext<DisplayContextType | undefined>(undefined);

export const DisplayProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DisplayConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<TimeStatus>({
    activePeriod: null,
    nextPeriod: null,
    countdown: "00:00:00",
  });

  // Load config from database on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("display_config")
          .select("config_data")
          .eq("config_key", "default")
          .maybeSingle();

        if (error) {
          console.error("Failed to load config from database:", error);
        } else if (data?.config_data) {
          setConfig({ 
            ...defaultConfig, 
            ...(data.config_data as unknown as Partial<DisplayConfig>) 
          });
        }
      } catch (e) {
        console.error("Error loading config:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'display_config', filter: 'config_key=eq.default' },
        (payload) => {
          if (payload.new && (payload.new as any).config_data) {
            setConfig((prev) => ({
              ...prev,
              ...((payload.new as any).config_data as unknown as Partial<DisplayConfig>)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update status every second
  useEffect(() => {
    const updateTimeStatus = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const currentTimeShort = currentTimeStr.substring(0, 5);

      // Filter timetable by current mode
      const relevantBlocks = config.masterTimetable.length > 0 
        ? config.masterTimetable.filter(b => b.mode === config.activeScheduleMode)
        : config.timetable.map(b => ({ ...b, mode: 'KBM' as const, dayOfWeek: currentDay, type: 'class' as const }));

      // 1. Find active block for today
      const todayBlocks = relevantBlocks.filter(b => b.dayOfWeek === currentDay);
      const active = todayBlocks.find(b => currentTimeShort >= b.startTime && currentTimeShort < b.endTime) || null;

      // 2. Find next block (can be tomorrow or beyond)
      let next: TimeBlock | null = null;
      let nextDate = new Date();
      
      // Search through next 7 days
      for (let d = 0; d < 8; d++) {
        const searchDay = (currentDay + d) % 7;
        const searchBlocks = relevantBlocks
          .filter(b => b.dayOfWeek === searchDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        for (const b of searchBlocks) {
          if (d === 0) {
            // If today, must be after current time
            if (b.startTime > currentTimeShort) {
              next = b;
              nextDate.setDate(now.getDate() + d);
              const [h, m] = b.startTime.split(':').map(Number);
              nextDate.setHours(h, m, 0, 0);
              break;
            }
          } else {
            // First block of any future day
            next = b;
            nextDate.setDate(now.getDate() + d);
            const [h, m] = b.startTime.split(':').map(Number);
            nextDate.setHours(h, m, 0, 0);
            break;
          }
        }
        if (next) break;
      }

      let countdownStr = "00:00:00";
      if (next) {
        const diffMs = nextDate.getTime() - now.getTime();
        if (diffMs > 0) {
          const totalSeconds = Math.floor(diffMs / 1000);
          const h = Math.floor(totalSeconds / 3600);
          const m = Math.floor((totalSeconds % 3600) / 60);
          const s = totalSeconds % 60;
          countdownStr = `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
        }
      }

      setStatus({
        activePeriod: active ? ({ ...active } as any) : null,
        nextPeriod: next ? ({ ...next } as any) : null,
        countdown: countdownStr,
      });
    };

    const timer = setInterval(updateTimeStatus, 1000);
    updateTimeStatus();
    return () => clearInterval(timer);
  }, [config.masterTimetable, config.timetable, config.activeScheduleMode]);

  const updateConfig = useCallback((updates: Partial<DisplayConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveToCloud = useCallback(async () => {
    setIsSaving(true);
    try {
      // Ensure we have a valid object to JSON.stringify
      const configToSave = JSON.parse(JSON.stringify(config));
      
      const { data: existing } = await supabase
        .from("display_config")
        .select("id")
        .eq("config_key", "default")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("display_config")
          .update({ config_data: configToSave, updated_at: new Date().toISOString() })
          .eq("config_key", "default");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("display_config")
          .insert([{ config_key: "default", config_data: configToSave }]);
        if (error) throw error;
      }
    } catch (e) {
      console.error("Failed to save config:", e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  return (
    <DisplayContext.Provider value={{ config, updateConfig, isLoading, saveToCloud, isSaving, status }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = () => {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
};
