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
    <footer className="flex items-center gap-[1.5vw] bg-transparent h-[8vh]">
      {/* Dalil Hari Ini Label */}
      <div className="flex-shrink-0">
        <span className="text-[var(--display-olive)] font-barlow font-black text-[2.2vw] uppercase tracking-tight">
          Dalil Hari Ini
        </span>
      </div>

      {/* Running Text Bar (Greenscreen) */}
      <div className="flex-1 h-full bg-[var(--greenscreen)] rounded-[1vw] overflow-hidden flex items-center shadow-inner">
        <div
          className="animate-marquee whitespace-nowrap font-barlow text-primary text-[2vw] font-bold px-[2vw]"
          style={{ 
            animationDuration: `${config.runningTextSpeed || 30}s`,
            animationPlayState: textToDisplay ? "running" : "paused"
          }}
        >
          {textToDisplay}
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;