import { useState, useEffect } from "react";

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplayClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = DAYS_ID[now.getDay()];
  const date = now.getDate();
  const month = MONTHS_ID[now.getMonth()];
  const year = now.getFullYear();
  const time = now.toLocaleTimeString("id-ID", { hour12: false });

  return (
    <div className="flex flex-col items-center justify-center bg-[var(--display-gold-dark)] px-[0.5vw] py-[1.5vh] w-full rounded-[1vw] text-white shadow-xl border border-white/10 shrink-0">
      <p className="font-barlow font-bold text-[1.3vw] leading-tight mb-[0.2vh] opacity-95 uppercase tracking-widest text-center">
        {day}, {date} {month} {year}
      </p>
      <p className="font-barlow font-black text-[4.4vw] leading-none tracking-tighter tabular-nums drop-shadow-lg text-white">
        {time}
      </p>
    </div>
  );
};

export default DisplayClock;
