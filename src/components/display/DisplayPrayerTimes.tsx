import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const DisplayPrayerTimes = () => {
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
          `http://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(location)}&country=Indonesia&method=11`
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
      <div className="w-full shrink-0 h-10 bg-[#1e5666] flex items-center justify-center">
        <span className="text-white font-montserrat font-medium text-[1vw] animate-pulse">Memuat Jadwal Shalat...</span>
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
    <div className="w-full shrink-0 h-10 md:h-12 bg-[#1e5666] flex items-center justify-between px-8 border-t border-white/10 overflow-hidden shadow-2xl relative z-10">
      {/* Left: Countdown - High Visibility */}
      <div className="flex items-center gap-4 py-1">
        {nextPrayer && (
          <div className="flex items-center gap-4">
            <span className="text-white font-montserrat font-bold text-[1.1vw] uppercase tracking-widest opacity-90">
              MENUJU {nextPrayer.name}:
            </span>
            <span className="text-[2.2vw] font-black text-yellow-300 tracking-[0.05em] font-montserrat tabular-nums leading-none">
              {nextPrayer.diff}
            </span>
          </div>
        )}
      </div>

      {/* Right: Prayer List - Pill Styled Boxes */}
      <div className="flex items-center gap-3">
        {prayerItems.map((item) => (
          <div 
            key={item.label} 
            className="flex items-center gap-3 bg-[#133c47] px-[1vw] py-[0.5vh] rounded-xl border border-white/10 shadow-sm"
          >
            <span className="text-white/60 font-montserrat font-bold text-[0.85vw] tracking-wider uppercase">{item.label}</span>
            <span className="text-white font-montserrat font-black text-[1.15vw] leading-none">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayPrayerTimes;
