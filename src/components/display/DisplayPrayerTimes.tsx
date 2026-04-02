import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const DisplayPrayerTimes = () => {
  const { config } = useDisplay();
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        // Using Aladhan API
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
    // Refresh every hour
    const interval = setInterval(fetchPrayerTimes, 3600000);
    return () => clearInterval(interval);
  }, [config.prayerLocation]);

  if (loading && !timings) {
    return (
      <div className="w-full shrink-0 h-10 bg-[#1e5666] flex items-center justify-center">
        <span className="text-white font-montserrat font-medium text-[1vw] animate-pulse">Memuat Jadwal Shalat...</span>
      </div>
    );
  }

  if (!timings) return null;

  const prayerItems = [
    { label: "IMSAK", time: timings.Imsak },
    { label: "SUBUH", time: timings.Fajr },
    { label: "TERBIT", time: timings.Sunrise },
    { label: "DZUHUR", time: timings.Dhuhr },
    { label: "ASHAR", time: timings.Asr },
    { label: "MAGHRIB", time: timings.Maghrib },
    { label: "ISYA", time: timings.Isha },
  ];

  return (
    <div className="w-full shrink-0 h-10 bg-[#1e5666] flex items-center justify-center border-t border-white/10">
      <div className="flex items-center gap-[2.5vw]">
        {prayerItems.map((item, index) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-white/60 font-montserrat font-black text-[0.85vw] tracking-wider">{item.label}</span>
            <span className="text-white font-montserrat font-black text-[1.1vw]">{item.time}</span>
            {index < prayerItems.length - 1 && (
              <span className="text-white/20 ml-[2.5vw] font-light">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayPrayerTimes;
