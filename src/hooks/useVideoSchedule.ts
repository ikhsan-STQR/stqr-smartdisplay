import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

export interface ProgramContent {
  contentType: "video" | "slider";
  content: string | string[];
  scheduleName: string | null;
}

// Built-in fixed TV Program Schedule
const BUILT_IN_PROGRAMS = [
  { name: "MUROTTAL AL-QUR'AN (Fajr)", start: "04:00", end: "06:00", id: "3S68n_V2F3o", days: [0,1,2,3,4,5,6] },
  { name: "LIVE KBM / PROFILE STQR", start: "07:00", end: "15:00", id: "default", days: [1,2,3,4,5] }, // Mon-Fri
  { name: "KAJIAN AKHIR PEKAN", start: "08:00", end: "10:00", id: "live_id_example", days: [0,6] }, // Sat-Sun
  { name: "ADZKAR SORE & TILAWAH", start: "18:00", end: "20:00", id: "another_id", days: [0,1,2,3,4,5,6] },
];

export const useVideoSchedule = () => {
  const { config } = useDisplay();
  const [activeProgram, setActiveProgram] = useState<ProgramContent>({
    contentType: config.contentType,
    content: config.contentType === "video" 
      ? (config.defaultVideoUrls && config.defaultVideoUrls.length > 0 ? config.defaultVideoUrls : [config.videoUrl]) 
      : config.sliderImages,
    scheduleName: null,
  });

  useEffect(() => {
    const updateProgram = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hh}:${mm}`;
      const currentDay = now.getDay();

      // 1. PRIORITY: Check Admin Panel Schedules
      const adminActive = config.schedules.find(s => 
        s.isActive && 
        s.type === "main" && 
        s.days.includes(currentDay) &&
        currentTime >= s.startTime && 
        currentTime < s.endTime
      );

      if (adminActive) {
        setActiveProgram({
          contentType: adminActive.contentType || "video",
          content: adminActive.content,
          scheduleName: adminActive.name,
        });
        return;
      }

      // 2. SECONDARY: Check Built-in "Live TV" Programs
      const builtInActive = BUILT_IN_PROGRAMS.find(p => 
        p.days.includes(currentDay) &&
        currentTime >= p.start &&
        currentTime < p.end
      );

      if (builtInActive) {
        const content = builtInActive.id === "default" 
          ? (config.defaultVideoUrls && config.defaultVideoUrls.length > 0 ? config.defaultVideoUrls : [config.videoUrl]) 
          : builtInActive.id;
        setActiveProgram({
          contentType: "video",
          content: content,
          scheduleName: builtInActive.name,
        });
        return;
      }

      // 3. FALLBACK: Global Default
      setActiveProgram({
        contentType: config.contentType,
        content: config.contentType === "video" 
          ? (config.defaultVideoUrls && config.defaultVideoUrls.length > 0 ? config.defaultVideoUrls : [config.videoUrl]) 
          : config.sliderImages,
        scheduleName: "DEFAULT (MURROTAL 24H)",
      });
    };

    updateProgram();
    const interval = setInterval(updateProgram, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [config.schedules, config.contentType, config.videoUrl, config.defaultVideoUrls, config.sliderImages]);

  return activeProgram;
};
