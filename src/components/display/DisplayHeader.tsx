import { useState, useEffect } from "react";
import logoStqr from "@/assets/logo-stqr.png";
import { useDisplay } from "@/context/DisplayContext";

const DAYS_ID = ["AHAD", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplayHeader = () => {
  const { config } = useDisplay();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = DAYS_ID[now.getDay()];
  const date = now.getDate();
  const month = MONTHS_ID[now.getMonth()];
  const year = now.getFullYear();
  const time = now.toLocaleTimeString("id-ID", { hour12: false }).replace(/\./g, ":");

  return (
    <header className="w-full flex items-start gap-[0.5vw] bg-transparent">
      {/* Col 1: Logo & Left Alignment (w-[24%]) */}
      <div className="w-[24%] shrink-0 flex items-start">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className="h-[10.5vh] w-[10.5vh] flex-shrink-0 object-contain mr-[0.5vw]"
        />
        <h1 className="text-[var(--display-brown)] font-barlow font-bold text-[1.8vw] tracking-normal leading-[1.1] pt-1">
          STQ Riyadhussholihiin
        </h1>
      </div>

      {/* Col 2: Main Title (flex-1) */}
      <div className="flex-1 flex flex-col justify-end h-[10.5vh] pb-1">
        <p className="text-[#9e8549] font-montserrat font-black text-[3vw] leading-none tracking-normal uppercase text-left">
          {config.headerTitle || "SMART DIGITAL INFORMATION SYSTEM"}
        </p>
      </div>

      {/* Col 3: Date & Clock (w-[22%]) - Exact Match with Right Sidebar */}
      <div className="w-[22%] shrink-0 flex flex-col items-center justify-center bg-[#8b7336] px-[1vw] py-[1.2vh] rounded-xl text-white shadow-md border border-white/10">
        <p className="font-barlow font-bold text-[1.4vw] leading-tight mb-[0.2vh] uppercase tracking-[0.1em] opacity-90">
          {day}, {date} {month} {year}
        </p>
        <p className="font-barlow font-black text-[4vw] leading-none tracking-tighter tabular-nums drop-shadow-md">
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
