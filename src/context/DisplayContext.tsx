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
}

interface DisplayContextType {
  config: DisplayConfig;
  updateConfig: (updates: Partial<DisplayConfig>) => void;
  isLoading: boolean;
  saveToCloud: () => Promise<void>;
  isSaving: boolean;
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
};

const DisplayContext = createContext<DisplayContextType | undefined>(undefined);

export const DisplayProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DisplayConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          setConfig({ ...defaultConfig, ...(data.config_data as unknown as Partial<DisplayConfig>) });
        }
      } catch (e) {
        console.error("Error loading config:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const updateConfig = useCallback((updates: Partial<DisplayConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const saveToCloud = useCallback(async () => {
    setIsSaving(true);
    try {
      const { data: existing } = await supabase
        .from("display_config")
        .select("id")
        .eq("config_key", "default")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("display_config")
          .update({ config_data: JSON.parse(JSON.stringify(config)) })
          .eq("config_key", "default");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("display_config")
          .insert([{ config_key: "default", config_data: JSON.parse(JSON.stringify(config)) }]);
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
    <DisplayContext.Provider value={{ config, updateConfig, isLoading, saveToCloud, isSaving }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = () => {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
};
