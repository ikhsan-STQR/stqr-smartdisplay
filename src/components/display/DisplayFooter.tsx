import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";

const DisplayFooter = () => {
  const { config, status } = useDisplay();
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

  const renderText = (text: string) => {
    if (!text) return null;
    // Split by Arabic character ranges
    const parts = text.split(/([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g);
    return parts.map((part, i) => {
      const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(part);
      if (isArabic) {
        return <span key={i} className="font-arabic-large">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const textToDisplay = activeSchedule 
    ? (activeSchedule.content as string) 
    : (Array.isArray(config.runningText) ? config.runningText.join(" | ") : config.runningText);

  return (
    <footer 
      className="w-full flex items-center gap-[0.5vw] h-[10vh] transition-colors duration-500"
      style={{ backgroundColor: config.marquee_wrapper_bg || "#133c47" }}
    >
      {/* Col 1: Next Period Countdown (w-[22%]) - Matching Sidebar Left */}
      <div 
        className="w-[22%] px-[1vw] py-[0.5vh] rounded-xl shadow-md flex flex-col items-center justify-center overflow-hidden shrink-0 h-full transition-colors duration-500"
        style={{ backgroundColor: config.left_countdown_bg || "#ffffff" }}
      >
        <div className="flex flex-col items-center justify-center p-[0.5vw]">
          <p 
            className="text-[2.7vw] font-montserrat font-black leading-none mb-1 tabular-nums drop-shadow-sm transition-colors duration-500"
            style={{ color: config.left_countdown_text || config.primary_color || "#8b7336" }}
          >
            {status.countdown || "00:00:00"}
          </p>
          <p 
            className="text-[0.9vw] font-jakarta font-bold uppercase tracking-[0.1em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center transition-colors duration-500"
            style={{ color: config.footer_text_color || "rgb(156 163 175)" }}
          >
            MENUJU {status.targetLabel}
          </p>
        </div>
      </div>
 
      {/* Col 2: Running Text Bar (flex-1) - Expanding to the right with Dynamic secondary background */}
      <div 
        className="flex-1 h-full rounded-[1vw] overflow-hidden flex items-center shadow-inner relative transition-colors duration-500"
        style={{ backgroundColor: config.running_text_bg || config.secondary_color || "#A8E6CF" }}
      >
        <div
          className="flex animate-marquee-seamless whitespace-nowrap font-montserrat font-medium text-[1.5vw] transition-colors duration-500 items-baseline"
          style={{
            color: config.running_text_color || "#133c47",
            animationDuration: `${config.runningTextSpeed || 30}s`,
            animationPlayState: textToDisplay ? "running" : "paused"
          }}
        >
          <span className="px-[4vw]">{renderText(textToDisplay) || `${config.organization_name} - Digital Information Display`}</span>
          <span className="px-[4vw]">{renderText(textToDisplay) || `${config.organization_name} - Digital Information Display`}</span>
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;