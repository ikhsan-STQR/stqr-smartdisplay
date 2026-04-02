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
  waktu: string;
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
    { kelas: "I-A", pelajaran: "TEMATIK", waktu: "07:30" },
    { kelas: "I-B", pelajaran: "CALISTUNG", waktu: "07:30" },
    { kelas: "I-C", pelajaran: "CALISTUNG", waktu: "07:30" },
    { kelas: "II-A", pelajaran: "P A I", waktu: "08:00" },
    { kelas: "II-B", pelajaran: "CALISTUNG", waktu: "08:00" },
    { kelas: "II-C", pelajaran: "TEMATIK", waktu: "08:00" },
    { kelas: "III-A", pelajaran: "B. INGGRIS", waktu: "08:30" },
    { kelas: "III-B", pelajaran: "PAI", waktu: "08:30" },
    { kelas: "IV-A", pelajaran: "TEMATIK", waktu: "09:00" },
    { kelas: "IV-B", pelajaran: "PAI", waktu: "09:00" },
    { kelas: "V-A", pelajaran: "ADAB & AKHLAK", waktu: "09:30" },
    { kelas: "V-B", pelajaran: "ADAB & AKHLAK", waktu: "09:30" },
    { kelas: "VI-A", pelajaran: "B. INGGRIS", waktu: "10:00" },
    { kelas: "VI-B", pelajaran: "PAI", waktu: "10:00" },
  ],
  dalilHariIni:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim)',
  runningText:
    '"Maukah aku tunjukkan sesuatu yang jika dilakukan akan membuat kalian saling mencintai? Sebarkan salam di antara kalian" (HR. Muslim) | Pendaftaran Santri Baru TA 2026/2027 dibuka! | Kegiatan Pesantren Kilat Ramadhan 1447H',
  runningTextSpeed: 30,
  schedules: [],
};

const DisplayContext = createContext<DisplayContextType | undefined>(undefined);

const STORAGE_KEY = "stqr_display_config";

export const DisplayProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<DisplayConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load config from localStorage", e);
      }
    }
    return defaultConfig;
  });

  const updateConfig = (updates: Partial<DisplayConfig>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    });
  };

  return (
    <DisplayContext.Provider value={{ config, updateConfig }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplay = () => {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplay must be used within DisplayProvider");
  return ctx;
};