import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";

const DisplaySidebar = () => {
  const { config } = useDisplay();
  const [activeSchedule, setActiveSchedule] = useState<ContentSchedule | null>(null);
  const [currentPoster, setCurrentPoster] = useState(0);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();

      const active = config.schedules.find(s => 
        s.isActive && 
        s.type === "announcement" && 
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

  useEffect(() => {
    const posters = Array.isArray(activeSchedule?.content) ? activeSchedule.content : [];
    if (posters.length > 1) {
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % posters.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeSchedule]);

  return (
    <div className="w-full h-full flex flex-col gap-[1vw]">
      {/* Announcement Banner */}
      <div className="bg-[var(--display-teal)] px-[1vw] py-[0.8vh] rounded-[0.6vw] text-center shadow-sm">
        <span className="text-white font-barlow font-bold text-[1.4vw] uppercase tracking-wider">
          Pengumuman Sekolah
        </span>
      </div>

      {/* Sidebar Green Area */}
      <div className="flex-1 bg-[var(--greenscreen)] rounded-[var(--radius)] shadow-inner relative overflow-hidden">
        {!activeSchedule ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <p className="text-white/20 font-bold uppercase tracking-tighter text-xl">Display Area</p>
          </div>
        ) : (
          <div className="absolute inset-0">
            {(Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content]).map((poster, i) => (
              <img
                key={i}
                src={poster as string}
                alt={`Pengumuman ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === currentPoster ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplaySidebar;
