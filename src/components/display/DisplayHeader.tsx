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
    <header className="flex items-stretch bg-primary islamic-pattern">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-5 py-2 flex-1">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className="w-14 h-14 flex-shrink-0 object-contain"
        />
        <div>
          <h1 className="text-primary-foreground font-barlow font-bold text-[14.5pt] tracking-wide leading-tight">
            STQ Riyadhussholihiin
          </h1>
          <p className="text-primary-foreground font-barlow font-bold text-[24pt] leading-none tracking-wide uppercase">
            School Digital Information Display
          </p>
        </div>
      </div>

      {/* Date & Clock */}
      <div className="flex flex-col items-end justify-center bg-orange px-5 py-2 min-w-[220px]">
        <p className="text-primary-foreground font-barlow font-bold text-[12pt]">
          {day}, {date} {month} {year}
        </p>
        <p className="text-primary-foreground font-barlow font-bold text-[26pt] leading-none tracking-wider tabular-nums">
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;