import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";

const DisplayFooter = () => {
  const { config } = useDisplay();
  const [activeSchedule, setActiveSchedule] = useState<ContentSchedule | null>(null);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();

      const active = config.schedules.find(s => 
        s.isActive && 
        s.type === "runningText" && 
        s.days.includes(currentDay) &&
        currentTime >= s.startTime && 
        currentTime < s.endTime
      );
      
      setActiveSchedule(active || null);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000);
    return () => clearInterval(interval);
  }, [config.schedules]);

  const textToDisplay = activeSchedule ? (activeSchedule.content as string) : config.runningText;

  return (
    <footer className="flex items-center gap-[0.75vw] bg-transparent h-[8vh]">
      {/* Dalil Hari Ini Label */}
      <div className="flex-shrink-0 bg-white px-[1vw] py-[0.5vh] rounded-xl shadow-md border border-gray-100 flex items-center justify-center min-w-[15vw] overflow-hidden">
        <span className="text-[#1e5666] font-montserrat font-black text-[1.45vw] uppercase tracking-tighter whitespace-nowrap">
          Dalil Hari Ini
        </span>
      </div>

      {/* Running Text Bar (Greenscreen) */}
      <div className="flex-1 h-full bg-[var(--greenscreen)] rounded-[1vw] overflow-hidden flex items-center shadow-inner">
        <div
          className="animate-marquee whitespace-nowrap font-montserrat font-medium text-primary text-[1.8vw] px-[2vw]"
          style={{ 
            animationDuration: `${config.runningTextSpeed || 30}s`,
            animationPlayState: textToDisplay ? "running" : "paused"
          }}
        >
          {textToDisplay || "STQ Riyadhussholihiin - Digital Information Display"}
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;