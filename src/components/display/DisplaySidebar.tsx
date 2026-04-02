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
  return (
    <div className="w-full h-full flex flex-col gap-[1vw]">
      {/* Announcement Banner */}
      <div className="bg-[var(--display-teal)] px-[1vw] py-[0.8vh] rounded-[0.6vw] text-center">
        <span className="text-white font-barlow font-bold text-[1.4vw] uppercase tracking-wider">
          Pengumuman Sekolah
        </span>
      </div>

      {/* Sidebar Green Area */}
      <div className="flex-1 bg-[var(--greenscreen)] rounded-[var(--radius)] shadow-inner">
        {/* Poster/Prayer placeholder */}
      </div>
    </div>
  );
};

export default DisplaySidebar;
