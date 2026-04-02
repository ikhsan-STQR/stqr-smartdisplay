import { useState, useEffect } from "react";
import logoStqr from "@/assets/logo-stqr.png";

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplayHeader = () => {
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
    <header className="w-full flex justify-between items-start bg-transparent">
      {/* Logo & Title */}
      <div className="flex items-center gap-[0.75vw]">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className="h-[10vh] w-[10vh] flex-shrink-0 object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-[var(--display-brown)] font-barlow font-bold text-[2.2vw] tracking-normal leading-[1.1]">
            STQ Riyadhussholihiin
          </h1>
          <p className="text-[var(--display-olive)] font-barlow font-black text-[3.8vw] leading-[0.9] tracking-normal uppercase">
            School Digital Information Display
          </p>
        </div>
      </div>

      {/* Date & Clock */}
      <div className="flex flex-col items-center justify-center bg-[#8b7336] px-[1vw] py-[1.2vh] w-[20%] rounded-xl text-white shadow-md shrink-0 border border-white/10">
        <p className="font-barlow font-bold text-[1.4vw] leading-tight mb-[0.2vh] uppercase tracking-[0.1em] opacity-90">
          {day}, {date} {month} {year}
        </p>
        <p className="font-barlow font-black text-[4.4vw] leading-none tracking-tighter tabular-nums drop-shadow-md">
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
