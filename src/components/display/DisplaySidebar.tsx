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

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplaySidebar = () => {
  const { config } = useDisplay();
  const [activeSchedule, setActiveSchedule] = useState<ContentSchedule | null>(null);
  const [currentPoster, setCurrentPoster] = useState(0);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer>(getNextPrayer());
  const [prayerSchedule, setPrayerSchedule] = useState(getTodayPrayerTimes());
  const [now, setNow] = useState(new Date());

  const [currentTime, setCurrentTime] = useState(
    `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`
  );

  // Update countdown and clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNextPrayer(getNextPrayer());
      const date = new Date();
      setNow(date);
      setCurrentTime(`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter active classes
  const activeClasses = config.jadwalPelajaran.filter(
    (item) => currentTime >= item.startTime && currentTime <= item.endTime
  );

  // Check schedules for announcements
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const current = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();

      const active = config.schedules.find(s => 
        s.isActive && 
        s.type === "announcement" && 
        s.days.includes(currentDay) &&
        current >= s.startTime && 
        current < s.endTime
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

  const dayStr = DAYS_ID[now.getDay()];
  const dateStr = `${now.getDate()} ${MONTH_ID[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className="w-full h-full flex flex-col gap-[2vh] font-barlow">
      {/* Block 1: Gold Clock Box (25% Height) */}
      <div className="h-[25%] bg-[#9e8549] rounded-2xl p-[1.5vw] flex flex-col items-center justify-center text-white shadow-2xl border border-white/10">
        <p className="font-extrabold text-[1.4vw] tracking-wider mb-1 uppercase opacity-90">
          {dayStr}, {dateStr}
        </p>
        <p className="font-black text-[4.8vw] leading-none tracking-tighter tabular-nums drop-shadow-lg">
          {timeStr}
        </p>
      </div>

      {/* Block 2: Dark Teal Section Bar (8% Height) */}
      <div className="h-[8%] bg-[#1e5666] flex items-center justify-center rounded-xl shadow-lg border border-white/5">
        <span className="text-white font-black text-[1.1vw] uppercase tracking-[0.3em]">
          Pengumuman Sekolah
        </span>
      </div>

      {/* Block 3: Widget Hub (Remaining ~67% Height) */}
      <div className="flex-1 bg-white rounded-2xl shadow-2xl border border-black/5 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Dynamic Content Frame (Posters/Ads) */}
          <div className="h-[28vh] bg-[#f8f9fa] relative overflow-hidden group border-b border-black/5 shadow-inner">
            {!activeSchedule ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-10">
                <p className="text-primary font-black uppercase tracking-widest text-[0.8vw]">Information Display</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                {(Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content]).map((poster, i) => (
                  <img
                    key={i}
                    src={poster as string}
                    alt={`Poster ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      i === currentPoster ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Prayer Times Widget */}
          <div className="bg-white px-[0.5vw] py-[1vh]">
            {prayers.map((p, i) => (
              <div 
                key={p.name}
                className={`flex items-center justify-between px-[1.2vw] py-[1vh] border-b border-black/5 last:border-0 rounded-lg transition-all ${
                  nextPrayer.name === p.name ? "bg-emerald-600 text-white shadow-lg scale-[1.02] z-10" : "text-slate-700"
                }`}
              >
                <div className="flex items-center gap-[1vw]">
                  <span className="text-[1.8vw] drop-shadow-sm">{PRAYER_ICONS[p.name]}</span>
                  <div className="flex flex-col">
                    <span className={`text-[1.1vw] font-black uppercase leading-none ${
                        nextPrayer.name === p.name ? "text-white" : "text-slate-500"
                    }`}>
                        {p.name}
                    </span>
                    {nextPrayer.name === p.name && (
                        <span className="text-[0.7vw] font-bold uppercase opacity-80">Menuju Waktu</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[1.3vw] font-black tabular-nums ${
                    nextPrayer.name === p.name ? "text-white" : "text-slate-900"
                    }`}>
                    {p.time}
                    </span>
                    {nextPrayer.name === p.name && (
                        <span className="text-[0.8vw] font-black text-yellow-300 animate-pulse">
                            {formatCountdown(nextPrayer.remainingMs)}
                        </span>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Class Schedule (Alternating Rows) */}
          <div className="mt-auto bg-[#f8f9fa] border-t border-black/5 divide-y divide-black/5">
             <div className="flex items-center justify-between px-[1.2vw] py-[0.8vh] bg-slate-100/50">
               <span className="text-slate-500 font-black text-[0.8vw] uppercase tracking-wider">Jadwal Kelas Aktif</span>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-emerald-700 font-black text-[0.7vw] uppercase font-jakarta">Live</span>
               </div>
             </div>
             {activeClasses.length === 0 ? (
               <div className="flex items-center justify-center py-[3vh] px-[2vw]">
                 <p className="text-slate-400 font-black text-[0.9vw] uppercase text-center italic tracking-widest opacity-60">
                    — Waktu Istirahat —
                 </p>
               </div>
             ) : (
               <div className="flex flex-col">
                 {activeClasses.map((item, i) => (
                   <div 
                    key={i} 
                    className={`flex items-center justify-between px-[1.2vw] py-[1.2vh] transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-[#cffafe]"
                    }`}
                   >
                     <div className="flex flex-col">
                       <span className="text-[0.7vw] font-black text-slate-400 leading-none">{item.kelas}</span>
                       <span className="text-[1vw] font-black text-[#1e5666] uppercase leading-tight tracking-tight">{item.pelajaran}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[0.9vw] font-black text-[#9e8549]">{item.startTime}</span>
                        <span className="text-[0.6vw] font-bold text-slate-400 uppercase">s/d {item.endTime}</span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySidebar;
