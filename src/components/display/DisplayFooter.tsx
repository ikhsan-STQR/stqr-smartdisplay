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

  const textToDisplay = activeSchedule ? (activeSchedule.content as string) : config.runningText;

  return (
    <footer className="w-full flex items-center gap-[0.5vw] bg-transparent h-[10vh]">
      {/* Col 1: Next Period Countdown (w-[22%]) - Matching Sidebar Left */}
      <div className="w-[22%] bg-white px-[1vw] py-[0.5vh] rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center overflow-hidden shrink-0 h-full">
        <div className="flex flex-col items-center justify-center p-[0.5vw]">
          <p className="text-[2.7vw] font-montserrat font-black text-[#133c47] leading-none mb-1 tabular-nums">
            {status.countdown || "00:00:00"}
          </p>
          <p className="text-[0.9vw] font-jakarta font-bold text-gray-500/80 uppercase tracking-[0.1em] whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center">
            MENUJU {status.targetLabel}
          </p>
        </div>
      </div>

      {/* Col 2: Running Text Bar (flex-1) - Expanding to the right with Light Tosca background */}
      <div className="flex-1 h-full bg-[#A8E6CF] rounded-[1vw] overflow-hidden flex items-center shadow-inner relative">
        <div
          className="flex animate-marquee-seamless whitespace-nowrap font-montserrat font-medium text-[#133c47] text-[1.5vw]"
          style={{
            animationDuration: `${config.runningTextSpeed || 30}s`,
            animationPlayState: textToDisplay ? "running" : "paused"
          }}
        >
          <span className="px-[4vw]">{textToDisplay || "STQ Riyadhussholihiin - Digital Information Display"}</span>
          <span className="px-[4vw]">{textToDisplay || "STQ Riyadhussholihiin - Digital Information Display"}</span>
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;