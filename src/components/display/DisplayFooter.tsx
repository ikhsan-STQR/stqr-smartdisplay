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
        <span className="text-yellow-400 font-montserrat font-black text-[2.7vw] leading-none uppercase tracking-tighter tabular-nums drop-shadow-sm">
          {status.countdown || "00:00:00"}
        </span>
        <span className="text-gray-500 font-jakarta font-bold text-[1.08vw] uppercase tracking-widest mt-1">
          {status.nextPeriod ? `menuju ${status.nextPeriod.subject_name || status.nextPeriod.period}` : "MENUNGGU JADWAL"}
        </span>
      </div>

      {/* Col 2: Running Text Bar (flex-1) - Expanding to the right with Light Tosca background */}
      <div className="flex-1 h-full bg-[#A8E6CF] rounded-[1vw] overflow-hidden flex items-center shadow-inner">
        <div
          className="animate-marquee whitespace-nowrap font-montserrat font-medium text-[#133c47] text-[1.5vw] px-[2vw]"
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