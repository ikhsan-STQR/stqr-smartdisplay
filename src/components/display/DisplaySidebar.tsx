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

  const currentPosters = activeSchedule 
    ? (Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content as string])
    : config.announcementPosters;

  useEffect(() => {
    const posters = Array.isArray(currentPosters) ? currentPosters : [];
    if (posters.length > 1) {
      const intervalDuration = (config.announcementInterval || 5) * 1000;
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % posters.length);
      }, intervalDuration);
      return () => clearInterval(timer);
    } else {
      setCurrentPoster(0);
    }
  }, [currentPosters.length, config.announcementInterval]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* INFO STQR Banner - Light Tosca Background */}
      <div className="bg-[#A8E6CF] py-[1.2vh] px-4 text-center overflow-hidden shrink-0 shadow-sm border-b border-[#96d1bc]">
        <span className="text-[#133c47] font-montserrat font-black text-[1.15vw] uppercase tracking-wider whitespace-nowrap inline-block w-full">
          Info STQR
        </span>
      </div>

      {/* Sidebar Content Area - Maximized specifically for 3:4 */}
      <div className="flex-1 min-h-0 bg-transparent flex items-center justify-center overflow-hidden">
        <div className="h-full aspect-[3/4] max-w-full bg-gray-50 shadow-inner relative overflow-hidden group">
          {(!currentPosters || currentPosters.length === 0 || !currentPosters[0]) ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <p className="text-gray-300 font-montserrat font-medium uppercase tracking-tighter text-sm">Belum Ada Poster</p>
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full">
              {currentPosters.map((poster, i) => (
                <img
                  key={i}
                  src={poster as string}
                  alt={`Pengumuman ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    i === currentPoster ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplaySidebar;
