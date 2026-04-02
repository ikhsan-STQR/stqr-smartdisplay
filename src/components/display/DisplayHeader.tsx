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
      <div className="flex items-center gap-[1.5vw]">
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
      <div className="flex flex-col items-center justify-center bg-[var(--display-olive)] px-[2.5vw] py-[1.2vh] min-w-[20vw] rounded-[1vw] text-white shadow-sm">
        <p className="font-barlow font-bold text-[1.6vw] leading-tight mb-[0.2vh]">
          {day}, {date} {month} {year}
        </p>
        <p className="font-barlow font-black text-[4.2vw] leading-none tracking-wider tabular-nums">
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
