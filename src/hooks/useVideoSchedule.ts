import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";

export interface ProgramContent {
  contentType: "video" | "slider";
  content: string | string[];
  scheduleName: string | null;
}

export const useVideoSchedule = () => {
  const { config } = useDisplay();
  const [activeProgram, setActiveProgram] = useState<ProgramContent>({
    contentType: config.contentType,
    content: config.contentType === "video" ? config.videoUrl : config.sliderImages,
    scheduleName: null,
  });

  useEffect(() => {
    const updateProgram = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hh}:${mm}`;
      const currentDay = now.getDay();

      // Find an active schedule of type "main"
      const active = config.schedules.find(s => 
        s.isActive && 
        s.type === "main" && 
        s.days.includes(currentDay) &&
        currentTime >= s.startTime && 
        currentTime < s.endTime
      );

      if (active) {
        setActiveProgram({
          contentType: active.contentType || "video",
          content: active.content,
          scheduleName: active.name,
        });
      } else {
        // Fallback to Default
        setActiveProgram({
          contentType: config.contentType,
          content: config.contentType === "video" ? config.videoUrl : config.sliderImages,
          scheduleName: "DEFAULT (24H)",
        });
      }
    };

    updateProgram();
    const interval = setInterval(updateProgram, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [config.schedules, config.contentType, config.videoUrl, config.sliderImages]);

  return activeProgram;
};
