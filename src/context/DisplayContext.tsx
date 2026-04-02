import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ContentSchedule {
  id: string;
  name: string;
  type: "main" | "announcement" | "runningText";
  contentType?: "video" | "slider"; // only for "main"
  content: string | string[]; // URL, Array of URLs, or Text
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  days: number[];    // [0, 1, 2, 3, 4, 5, 6] (0 = Sunday)
  isActive: boolean;
}

export interface ScheduleItem {
  kelas: string;
  pelajaran: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
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
  schedules: ContentSchedule[];
}

interface DisplayContextType {
  config: DisplayConfig;
  updateConfig: (updates: Partial<DisplayConfig>) => void;
  persistConfig: () => void;
}

const defaultConfig: DisplayConfig = {
  contentType: "slider",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ",
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
    { kelas: "I-A", pelajaran: "TEMATIK", startTime: "07:30", endTime: "09:00" },
    { kelas: "I-B", pelajaran: "CALISTUNG", startTime: "07:30", endTime: "09:00" },
    { kelas: "I-C", pelajaran: "CALISTUNG", startTime: "07:30", endTime: "09:00" },
    { kelas: "II-A", pelajaran: "P A I", startTime: "07:30", endTime: "09:00" },
    { kelas: "II-B", pelajaran: "CALISTUNG", startTime: "07:30", endTime: "09:00" },
    { kelas: "II-C", pelajaran: "TEMATIK", startTime: "07:30", endTime: "09:00" },
    { kelas: "III-A", pelajaran: "B. INGGRIS", startTime: "09:30", endTime: "11:00" },
    { kelas: "III-B", pelajaran: "PAI", startTime: "09:30", endTime: "11:00" },
    { kelas: "IV-A", pelajaran: "TEMATIK", startTime: "09:30", endTime: "11:00" },
    { kelas: "IV-B", pelajaran: "PAI", startTime: "09:30", endTime: "11:00" },
    { kelas: "V-A", pelajaran: "ADAB & AKHLAK", startTime: "09:30", endTime: "11:00" },
    { kelas: "V-B", pelajaran: "ADAB & AKHLAK", startTime: "09:30", endTime: "11:00" },
    { kelas: "VI-A", pelajaran: "B. INGGRIS", startTime: "11:30", endTime: "13:00" },
    { kelas: "VI-B", pelajaran: "PAI", startTime: "11:30", endTime: "13:00" },
  ],
  dalilHariIni:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim)',
  runningText:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim) | Pendaftaran Santri Baru TA 2026/2027 dibuka! | Kegiatan Pesantren Kilat Ramadhan 1447H',
  runningTextSpeed: 30,
  schedules: [],
};

const STORAGE_KEY = "stqr_display_settings";

const DisplayContext = React.createContext<DisplayContextType | undefined>(undefined);

export const DisplayProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = React.useState<DisplayConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultConfig;
    } catch (e) {
      console.error("Failed to load config from localStorage", e);
      return defaultConfig;
    }
  });

  const updateConfig = (updates: Partial<DisplayConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const persistConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Manually dispatch storage event to notify other windows (optional but adds reliability in dev)
    window.dispatchEvent(new Event("storage_local_update"));
  };

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent | any) => {
      if (e.key === STORAGE_KEY || e.type === "storage_local_update") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setConfig(JSON.parse(saved));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage_local_update", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_local_update", handleStorageChange);
    };
  }, []);

  return (
    <DisplayContext.Provider value={{ config, updateConfig, persistConfig }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = () => {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
};