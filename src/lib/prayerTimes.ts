import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from "adhan";

// Pandeglang, Banten coordinates
const PANDEGLANG_COORDS = new Coordinates(-6.3108, 106.1064);

export interface PrayerSchedule {
  subuh: string;
  terbit: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface NextPrayer {
  name: string;
  time: Date;
  remainingMs: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function getTodayPrayerTimes(): PrayerSchedule {
  const now = new Date();
  const params = CalculationMethod.Singapore();
  const pt = new PrayerTimes(PANDEGLANG_COORDS, now, params);

  return {
    subuh: formatTime(pt.fajr),
    terbit: formatTime(pt.sunrise),
    dzuhur: formatTime(pt.dhuhr),
    ashar: formatTime(pt.asr),
    maghrib: formatTime(pt.maghrib),
    isya: formatTime(pt.isha),
  };
}

export function getNextPrayer(): NextPrayer {
  const now = new Date();
  const params = CalculationMethod.Singapore();
  const pt = new PrayerTimes(PANDEGLANG_COORDS, now, params);

  const prayers = [
    { name: "Subuh", time: pt.fajr },
    { name: "Terbit", time: pt.sunrise },
    { name: "Dzuhur", time: pt.dhuhr },
    { name: "Ashar", time: pt.asr },
    { name: "Maghrib", time: pt.maghrib },
    { name: "Isya", time: pt.isha },
  ];

  for (const p of prayers) {
    if (p.time.getTime() > now.getTime()) {
      return { name: p.name, time: p.time, remainingMs: p.time.getTime() - now.getTime() };
    }
  }

  // All prayers passed, next is tomorrow's Subuh
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ptTomorrow = new PrayerTimes(PANDEGLANG_COORDS, tomorrow, params);
  return {
    name: "Subuh",
    time: ptTomorrow.fajr,
    remainingMs: ptTomorrow.fajr.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}
