import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";
import { getTodayPrayerTimes, getNextPrayer, formatCountdown, NextPrayer } from "@/lib/prayerTimes";

const PRAYER_ICONS: Record<string, string> = {
  Subuh: "🌙",
  Terbit: "🌅",
  Dzuhur: "☀️",
  Ashar: "🌤️",
  Maghrib: "🌇",
  Isya: "🌙",
};

const DisplaySidebar = () => {
  const { config } = useDisplay();
  const [activeSchedule, setActiveSchedule] = useState<ContentSchedule | null>(null);
  const [currentPoster, setCurrentPoster] = useState(0);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>(getNextPrayer());
  const [prayerSchedule, setPrayerSchedule] = useState(getTodayPrayerTimes());

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check schedules for announcements
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

  // Poster slider rotation
  useEffect(() => {
    const posters = Array.isArray(activeSchedule?.content) ? activeSchedule.content : [];
    if (posters.length > 1) {
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % posters.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeSchedule]);

  const prayers = [
    { name: "Subuh", time: prayerSchedule.subuh },
    { name: "Dzuhur", time: prayerSchedule.dzuhur },
    { name: "Ashar", time: prayerSchedule.ashar },
    { name: "Maghrib", time: prayerSchedule.maghrib },
    { name: "Isya", time: prayerSchedule.isya },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-[1vw]">
      {/* 1. Upcoming Prayer Panel (Emerald Green) */}
      <div className="bg-emerald-800 rounded-[1vw] p-[1vw] shadow-md border border-white/10 flex flex-col items-center justify-center text-center">
        <h3 className="text-white font-barlow font-black text-[0.8vw] uppercase tracking-[0.15em] opacity-90 mb-[0.2vh]">
          Waktu Adzan Berikutnya
        </h3>
        <p className="text-white font-barlow text-[0.5vw] font-bold uppercase tracking-widest opacity-70 mb-[0.6vh]">
          Pandeglang, Banten
        </p>
        
        <div className="flex flex-col items-center">
          <span className="text-white font-barlow font-black text-[4vw] leading-none mb-[0.4vh]">
            {nextPrayer.name}
          </span>
          <div className="bg-white/10 px-[1vw] py-[0.3vh] rounded-full backdrop-blur-sm border border-white/5">
            <span className="text-white font-barlow font-bold text-[0.6vw] uppercase tracking-wider mr-2">
              Update Shalat Dalam:
            </span>
            <span className="text-white font-mono font-bold text-[1vw]">
              {formatCountdown(nextPrayer.remainingMs)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Prayer Times List */}
      <div className="bg-white rounded-[1vw] shadow-sm border border-black/5 overflow-hidden">
        {prayers.map((p, i) => (
          <div 
            key={p.name}
            className={`flex items-center justify-between px-[1vw] py-[0.8vh] font-barlow ${
              i % 2 === 1 ? "bg-[#cffafe]" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-[0.8vw]">
              <span className="text-[1.2vw]">{PRAYER_ICONS[p.name]}</span>
              <span className={`text-[1vw] font-bold uppercase tracking-wide ${
                nextPrayer.name === p.name ? "text-emerald-800" : "text-emerald-900/70"
              }`}>
                {p.name}
              </span>
            </div>
            <span className={`text-[1.2vw] font-black ${
              nextPrayer.name === p.name ? "text-emerald-800" : "text-emerald-950"
            }`}>
              {p.time}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Class Schedule List */}
      <div className="bg-white rounded-[1vw] shadow-sm border border-black/5 overflow-hidden flex flex-col min-h-0">
        <div className="bg-emerald-900/10 px-[1vw] py-[0.4vh] text-center border-b border-black/5">
             <span className="text-emerald-900 font-barlow font-black text-[0.7vw] uppercase tracking-wider">Jadwal Pelajaran</span>
        </div>
        <div className="overflow-y-auto max-h-[16vh] scrollbar-hide">
          {config.jadwalPelajaran.map((item, i) => (
            <div 
              key={i}
              className={`flex items-center justify-between px-[1vw] py-[0.6vh] font-barlow ${
                i % 2 === 1 ? "bg-[#cffafe]" : "bg-white"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[0.6vw] font-bold text-emerald-900/50 leading-none">{item.kelas}</span>
                <span className="text-[0.8vw] font-black text-emerald-900 uppercase leading-tight">{item.pelajaran}</span>
              </div>
              <span className="text-[0.9vw] font-black text-emerald-800">{item.waktu}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Announcement Display Area (Greenscreen Placeholder) */}
      <div className="flex-1 min-h-[12vh] bg-[var(--greenscreen)] rounded-[var(--radius)] shadow-inner relative overflow-hidden group">
        {!activeSchedule ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-30 group-hover:opacity-50 transition-opacity">
            <div className="w-[3vw] h-[3vw] border-[0.2vw] border-white/30 rounded-full flex items-center justify-center mb-1">
               <span className="text-white text-xl font-bold">i</span>
            </div>
            <p className="text-white font-barlow font-bold uppercase tracking-widest text-[0.6vw]">Info Digital</p>
          </div>
        ) : (
          <div className="absolute inset-0">
            {(Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content]).map((poster, i) => (
              <img
                key={i}
                src={poster as string}
                alt={`Poster ${i + 1}`}
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
