import { useState, useEffect } from "react";
import logoStqr from "@/assets/logo-stqr.png";
import { useDisplay } from "@/context/DisplayContext";

const DAYS_ID = ["AHAD", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplayHeader = ({ isMobile }: { isMobile?: boolean }) => {
  const { config, settings } = useDisplay();
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
    <header className={`w-full flex items-center gap-[0.5vw] bg-transparent ${isMobile ? 'h-full px-[1vw]' : ''}`}>
      {/* Col 1: Logo (Fixed size) */}
      <div className="shrink-0 flex items-start">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className={`${isMobile ? 'h-[16vh] w-[16vh]' : 'h-[14vh] w-[14vh]'} flex-shrink-0 object-contain mr-[0.8vw]`}
        />
      </div>

      {/* Col 2: Titles Stacked (flex-1) */}
      <div className={`flex-1 flex flex-col justify-center ${isMobile ? 'h-full' : 'h-[14vh]'}`}>
        <div className="flex flex-col">
          <span className={`${isMobile ? 'text-[2.5vw]' : 'text-[2.5vw]'} text-[var(--display-brown)] font-montserrat font-black leading-none mb-1 opacity-80 uppercase tracking-tight`}>
            STQ Riyadhussholihiin
          </span>
          <h1 className={`${isMobile ? 'text-[3.5vw]' : 'text-[3.1vw]'} text-[#9e8549] font-montserrat font-black leading-none uppercase tracking-tighter whitespace-nowrap`}>
            {config.headerTitle || "SMART DIGITAL INFORMATION SYSTEM"}
          </h1>
        </div>
      </div>

      {/* Col 3: Date & Clock (w-[24.5% Mobile / 20% Desktop]) - Sync with narrowed Right Sidebar */}
      <div className={`${isMobile ? 'w-[24.5%] py-[0.8vh] min-h-[16vh]' : 'w-[20%] py-[1vh]'} shrink-0 flex flex-col items-center justify-center bg-[#8b7336] px-[1vw] rounded-xl text-white shadow-md border border-white/10 relative overflow-hidden`}>
        {/* Mode Indicator Overlay */}
        <div className={`absolute top-0 right-0 px-[0.8vw] py-[0.3vh] bg-yellow-400 text-[#1a3a3a] font-montserrat font-black ${isMobile ? 'text-[0.65vw]' : 'text-[0.65vw]'} rounded-bl-lg tracking-widest shadow-sm`}>
          MODA {settings.active_mode}
        </div>
        
        <p className={`font-montserrat font-bold ${isMobile ? 'text-[1.3vw] mt-[1.2vh]' : 'text-[1.3vw] mt-[1.8vh]'} leading-tight mb-0 uppercase tracking-tight opacity-90`}>
          {day}, {date} {month} {year}
        </p>
        <p className={`font-montserrat font-bold ${isMobile ? 'text-[3.8vw]' : 'text-[3.8vw]'} leading-none tracking-tighter tabular-nums drop-shadow-md`}>
          {time}
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
