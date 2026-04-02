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
  const dalilText = config.dalilHariIni ? `${config.dalilHariIni.toUpperCase()} — ` : "";

  return (
    <footer className="w-full relative h-full flex items-end font-barlow pb-[1vh]">
      {/* 1. Iconic Left Tab (Dalil Hari Ini) - Overlaps Marquee */}
      <div className="absolute left-[2vw] bottom-[4.5vh] z-20">
        <div className="bg-white px-[4vw] py-[1.5vh] rounded-tr-[4.5vw] rounded-tl-2xl shadow-[-15px_-5px_30px_rgba(0,0,0,0.1)] border-t border-r border-black/5 flex items-center justify-center">
          <span className="text-[#1a1a1a] font-black text-[1.8vw] uppercase tracking-tighter">
            Dalil Hari Ini
          </span>
        </div>
      </div>

      {/* 2. Running Text Marquee Hub (Stretches Behind Tab) */}
      <div className="w-full h-[8vh] bg-white rounded-2xl overflow-hidden flex items-center shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-black/5 relative z-10 mx-auto">
        <div
          className="animate-marquee whitespace-nowrap text-[#1e5666] text-[2.8vw] font-black px-[8vw] uppercase flex items-center"
          style={{ 
            animationDuration: `${config.runningTextSpeed || 30}s`,
            animationPlayState: textToDisplay ? "running" : "paused"
          }}
        >
          <span className="text-[#9e8549] mr-4">{dalilText}</span>
          <span>{textToDisplay}</span>
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;