import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const DisplayPrayerTimes = ({ isMobile }: { isMobile?: boolean }) => {
  const { config } = useDisplay();
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: string } | null>(null);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        const location = config.prayerLocation || "Pandeglang, Banten";
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(location)}&country=Indonesia&method=11`
        );
        const data = await response.json();
        if (data.code === 200) {
          setTimings(data.data.timings);
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
    const interval = setInterval(fetchPrayerTimes, 3600000);
    return () => clearInterval(interval);
  }, [config.prayerLocation]);

  useEffect(() => {
    if (!timings) return;

    const calculateCountdown = () => {
      const now = new Date();
      const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const displayNames: { [key: string]: string } = {
        Fajr: "SUBUH",
        Dhuhr: "DZUHUR",
        Asr: "ASHAR",
        Maghrib: "MAGHRIB",
        Isha: "ISYA"
      };

      let upcoming: { name: string; time: string; target: Date } | null = null;

      for (const name of prayerNames) {
        const [hours, minutes] = timings[name].split(":").map(Number);
        const target = new Date(now);
        target.setHours(hours, minutes, 0, 0);

        if (target > now) {
          upcoming = { name: displayNames[name], time: timings[name], target };
          break;
        }
      }

      // If all prayers today have passed, target tomorrow's Subuh
      if (!upcoming) {
        const [hours, minutes] = timings.Fajr.split(":").map(Number);
        const target = new Date(now);
        target.setDate(target.getDate() + 1);
        target.setHours(hours, minutes, 0, 0);
        upcoming = { name: "SUBUH", time: timings.Fajr, target };
      }

      const diffMs = upcoming.target.getTime() - now.getTime();
      const h = Math.floor(diffMs / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, "0");

      setNextPrayer({
        name: upcoming.name,
        time: upcoming.time,
        diff: `${h}:${m}:${s}`
      });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [timings]);

  if (loading && !timings) {
    return (
      <div className={`w-full shrink-0 ${isMobile ? 'h-6' : 'h-10'} bg-[#1e5666] flex items-center justify-center`}>
        <span className={`text-white font-montserrat font-medium ${isMobile ? 'text-[0.7vw]' : 'text-[1vw]'} animate-pulse`}>Memuat Jadwal Shalat...</span>
      </div>
    );
  }

  if (!timings) return null;

  const prayerItems = [
    { label: "SUBUH", time: timings.Fajr },
    { label: "TERBIT", time: timings.Sunrise },
    { label: "DZUHUR", time: timings.Dhuhr },
    { label: "ASHAR", time: timings.Asr },
    { label: "MAGHRIB", time: timings.Maghrib },
    { label: "ISYA", time: timings.Isha },
  ];

  return (
    <div className={`w-full shrink-0 ${isMobile ? 'h-[72px]' : 'h-24 md:h-[110px]'} bg-[#1e5666] flex items-center justify-center px-[2vw] border-t border-white/10 overflow-hidden shadow-2xl relative z-10 gap-[3vw]`}>
      {/* Left Section: Header Block */}
      <div className="flex items-center h-full shrink-0">
        <div className={`flex flex-col items-center justify-center bg-yellow-400 px-[1.2vw] py-[0.8vh] ${isMobile ? 'h-[75%] min-w-[7.2vw]' : 'h-[82%] min-w-[8.5vw]'} rounded-2xl border border-white/10 shadow-sm select-none whitespace-nowrap`}>
          <span className={`text-[#133c47] font-montserrat font-bold ${isMobile ? 'text-[0.65vw]' : 'text-[0.8vw]'} uppercase tracking-[0.2em] opacity-90 mb-0`}>
            PRAYER
          </span>
          <span className={`text-[#133c47] font-montserrat font-black ${isMobile ? 'text-[2vw]' : 'text-[2.4vw]'} uppercase tracking-tighter leading-[0.9]`}>
            TIME
          </span>
        </div>
      </div>

      {/* Middle Section: Countdown */}
      {nextPrayer && (
        <div className="flex flex-col items-center justify-center leading-tight shrink-0">
          <span className={`text-white font-montserrat font-black ${isMobile ? 'text-[1vw]' : 'text-[1.15vw]'} uppercase tracking-[0.15em] opacity-90 mb-1 whitespace-nowrap`}>
            MENUJU WAKTU {nextPrayer.name}:
          </span>
          <span className={`${isMobile ? 'text-[2.2vw]' : 'text-[2.6vw]'} font-black text-yellow-300 tracking-[0.05em] font-montserrat tabular-nums leading-[0.9]`}>
            {nextPrayer.diff}
          </span>
        </div>
      )}

      {/* Right Section: Prayer List */}
      <div className="flex items-center gap-[0.5vw] h-full py-2 shrink-0">
        {prayerItems.map((item) => (
          <div 
            key={item.label} 
            className={`flex flex-col items-center justify-center bg-[#133c47] px-[1.1vw] py-[0.8vh] ${isMobile ? 'h-[75%] min-w-[7.2vw]' : 'h-[82%] min-w-[8.5vw]'} rounded-2xl border border-white/10 shadow-sm transition-all hover:bg-[#1a4a58]`}
          >
            <span className={`text-yellow-400 font-montserrat font-bold ${isMobile ? 'text-[0.65vw]' : 'text-[0.8vw]'} tracking-wider uppercase mb-1`}>{item.label}</span>
            <span className={`text-white font-montserrat font-black ${isMobile ? 'text-[1.4vw]' : 'text-[1.8vw]'} leading-none text-center w-full`}>{item.time}</span>
          </div>
        ))}
      </div>

      {/* Footnote Credit Watermark - Final Styling: Subtler 10px / 30% opacity */}
      <div className="absolute bottom-0 right-4 z-20 select-none pointer-events-none opacity-30">
        <span className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} text-white font-montserrat tracking-tight leading-none`}>
          Developed by Ikhsan Abu Ahsan © 2026
        </span>
      </div>
    </div>
  );
};

export default DisplayPrayerTimes;
