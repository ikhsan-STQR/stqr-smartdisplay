import { useState, useEffect } from "react";

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
    <header className="flex items-stretch bg-emerald-dark islamic-pattern">
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-5 py-3 flex-1">
        <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-md border-2 border-gold flex-shrink-0">
          <span className="text-primary font-bold text-xs text-center leading-tight">STQ</span>
        </div>
        <div>
          <h1 className="text-primary-foreground font-poppins font-bold text-xl tracking-wide leading-tight">
            STQ Riyadhussholihiin
          </h1>
          <p className="text-gold font-poppins font-semibold text-sm tracking-widest uppercase">
            School Digital Information Display
          </p>
        </div>
      </div>

      {/* Date & Clock */}
      <div className="flex flex-col items-end justify-center bg-orange px-5 py-2 min-w-[220px]">
        <p className="text-primary-foreground font-poppins font-semibold text-sm">
          {day}, {date} {month} {year}
        </p>
        <p className="text-primary-foreground font-poppins font-bold text-3xl tracking-wider tabular-nums">
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
