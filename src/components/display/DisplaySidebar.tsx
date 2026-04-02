import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { getTodayPrayerTimes, getNextPrayer, formatCountdown } from "@/lib/prayerTimes";

type Panel = "jadwal" | "sholat" | "pengumuman";

const PANEL_ORDER: Panel[] = ["jadwal", "sholat", "pengumuman"];
const PANEL_LABELS: Record<Panel, string> = {
  jadwal: "Jadwal Kelas",
  sholat: "Jadwal Shalat Hari Ini",
  pengumuman: "Pengumuman Sekolah",
};

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
  const [activePanel, setActivePanel] = useState<Panel>("sholat");
  const [currentPoster, setCurrentPoster] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState(getTodayPrayerTimes());
  const [nextPrayer, setNextPrayer] = useState(getNextPrayer());
  const [fadeIn, setFadeIn] = useState(true);

  // Panel rotation
  useEffect(() => {
    const panels = config.announcementPosters.length > 0
      ? PANEL_ORDER
      : PANEL_ORDER.filter((p) => p !== "pengumuman");

    let idx = panels.indexOf(activePanel);
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        idx = (idx + 1) % panels.length;
        setActivePanel(panels[idx]);
        setFadeIn(true);
      }, 500);
    }, 10000);
    return () => clearInterval(timer);
  }, [config.announcementPosters.length]);

  // Prayer times refresh every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setPrayerTimes(getTodayPrayerTimes());
      setNextPrayer(getNextPrayer());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poster rotation
  useEffect(() => {
    if (activePanel === "pengumuman" && config.announcementPosters.length > 1) {
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % config.announcementPosters.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activePanel, config.announcementPosters.length]);

  const countdown = formatCountdown(nextPrayer.remainingMs);
  const prayerList = [
    { name: "Subuh", time: prayerTimes.subuh },
    { name: "Terbit", time: prayerTimes.terbit },
    { name: "Dzuhur", time: prayerTimes.dzuhur },
    { name: "Ashar", time: prayerTimes.ashar },
    { name: "Maghrib", time: prayerTimes.maghrib },
    { name: "Isya", time: prayerTimes.isya },
  ];

  return (
    <div className="w-[28%] flex flex-col m-[0.5vw] ml-0 gap-[0.5vw]">
      {/* Countdown to next prayer */}
      <div className="bg-gold rounded-[0.8vw] px-[1vw] py-[0.8vh] text-center">
        <p className="text-primary-foreground font-barlow font-bold text-[1.1vw] uppercase tracking-wider">
          Adzan {nextPrayer.name} dalam :
        </p>
        <p className="text-primary-foreground font-barlow font-black text-[3.2vw] leading-none tracking-wider tabular-nums">
          {countdown}
        </p>
      </div>

      {/* Panel header */}
      <div className="bg-primary px-[1vw] py-[0.4vh] rounded-t-[0.4vw]">
        <span className="text-primary-foreground font-barlow font-bold text-[1.2vw] uppercase tracking-wider">
          🕌 {PANEL_LABELS[activePanel]}
        </span>
      </div>

      {/* Panel content */}
      <div
        className={`flex-1 bg-card rounded-b-[0.8vw] overflow-hidden relative transition-opacity duration-500 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {activePanel === "jadwal" && (
          <table className="w-full">
            <tbody>
              {config.jadwalPelajaran.map((item, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? "bg-muted" : "bg-card"
                  } border-b border-border`}
                >
                  <td className="px-[0.8vw] py-[0.2vh] font-bold text-foreground font-barlow text-[1.1vw] text-center w-[30%]">
                    {item.kelas}
                  </td>
                  <td className="px-[0.8vw] py-[0.2vh] font-barlow font-bold text-foreground text-[1.1vw] text-center">
                    {item.pelajaran}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activePanel === "sholat" && (
          <div className="p-[0.5vw]">
            {prayerList.map((p, i) => {
              const isNext = p.name === nextPrayer.name;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-[0.8vw] py-[0.5vh] rounded-[0.3vw] mb-[0.2vh] font-barlow text-[1.2vw] ${
                    isNext
                      ? "bg-gold text-primary-foreground font-black"
                      : "text-foreground font-bold"
                  }`}
                >
                  <span className="flex items-center gap-[0.4vw]">
                    <span>{PRAYER_ICONS[p.name]}</span>
                    {p.name}
                  </span>
                  <span className="tabular-nums">{p.time}</span>
                </div>
              );
            })}
          </div>
        )}

        {activePanel === "pengumuman" && (
          <div className="absolute inset-0">
            {config.announcementPosters.map((poster, i) => (
              <img
                key={i}
                src={poster}
                alt={`Pengumuman ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 rounded-b-[0.8vw] ${
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
