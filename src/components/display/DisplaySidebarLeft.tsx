import { useState, useEffect } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";

const DisplaySidebarLeft = () => {
  const { config, status, settings } = useDisplay();
  const [activeItems, setActiveItems] = useState<ScheduleItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    const updateActiveSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      const filtered = config.jadwalPelajaran.filter(item =>
        currentTime >= item.startTime && currentTime < item.endTime
      );

      setActiveItems(filtered);
    };

    updateActiveSchedule();
    const interval = setInterval(updateActiveSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [config.jadwalPelajaran]);

  useEffect(() => {
    if (activeItems.length > ITEMS_PER_PAGE) {
      const pageInterval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % Math.ceil(activeItems.length / ITEMS_PER_PAGE));
      }, 8000); // Cycle every 8 seconds
      return () => clearInterval(pageInterval);
    } else {
      setCurrentPage(0);
    }
  }, [activeItems.length]);

  const displayedItems = activeItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="flex-1 flex flex-col gap-[0.5vw] h-full overflow-hidden w-full">
      {/* Status Box - Simplified Single Line */}
      <div className="w-full bg-[#133c47] rounded-xl p-[1.5vw] shadow-lg border border-white/10 flex items-center justify-center min-h-[8vh] shrink-0">
        <h2 className="text-yellow-400 font-montserrat font-black text-[1.75vw] uppercase tracking-tighter text-center leading-none whitespace-nowrap">
          {status.activePeriod 
            ? (status.activePeriod.subject_name !== "-" ? status.activePeriod.subject_name : (status.activePeriod.description || status.activePeriod.period)) 
            : "TIDAK ADA KEGIATAN"}
        </h2>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 w-full bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col p-2">
        {(() => {
          const active = status.activePeriod;
          if (!active) {
            const today = new Date().getDay(); // 0: Ahad, 4: Kamis, 5: Jumat, 6: Sabtu
            const isWeekendOrThursday = today === 4 || today === 5 || today === 6;
            
            return (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm animate-in fade-in zoom-in duration-1000">
                <div className="w-20 h-20 bg-[#1a3a3a]/5 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">👋</span>
                </div>
                <h2 className="text-[#1a3a3a] font-montserrat font-black text-[2vw] leading-tight uppercase tracking-tighter mb-4">
                  {isWeekendOrThursday ? "Sampai Jumpa Hari Ahad" : "Sampai Jumpa Esok Hari"}
                </h2>
                <p className="text-gray-500 font-jakarta font-bold text-[1vw] uppercase tracking-[0.2em] opacity-80">
                  Dengan Semangat Belajar Baru
                </p>
                
                {/* Decorative Pattern at bottom */}
                <div className="mt-8 opacity-10">
                   <div className="flex gap-2">
                     {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#1a3a3a]" />)}
                   </div>
                </div>
              </div>
            );
          }

          const name = active.subject_name.toUpperCase();
          const desc = (active.description || "").toUpperCase();
          let instructions = null;

          if (desc.includes("APEL BERSAMA")) {
            instructions = settings.note_apel_bersama;
          } else if (desc.includes("APEL PAGI")) {
            instructions = settings.note_apel_pagi;
          } else if (desc.includes("ISTIRAHAT") || name === "-") {
            instructions = settings.note_istirahat;
          } else if (desc.includes("PULANG")) {
            instructions = settings.note_pulang;
          }

          if (instructions) {
            return (
              <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl flex flex-col items-center justify-center text-center p-6 animate-in zoom-in fade-in duration-700">
                <h2 className="text-[#133c47] font-montserrat font-black text-[2vw] mb-4 uppercase tracking-tight border-b-4 border-primary/20 pb-2 px-4 shadow-sm">
                  {active.subject_name !== "-" ? active.subject_name : (active.description || active.period)}
                </h2>
                <div className="text-gray-700 font-jakarta font-black text-[1.4vw] leading-[1.8] uppercase whitespace-pre-line text-center max-w-[95%] tracking-wide">
                  {instructions}
                </div>
              </div>
            );
          }

          /* Normal Class Schedule List */
          return (
            <div className="h-full flex flex-col">
              {activeItems.length > 0 ? (
                <div
                  className="w-full flex-1 flex flex-col gap-2 transition-opacity duration-500 ease-in-out"
                  key={currentPage}
                >
                  {displayedItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 animate-in fade-in duration-500">
                      <span className="text-[#1e5666] font-montserrat font-black text-[1.2vw] w-[4vw] shrink-0">{item.kelas}</span>
                      <span className="text-gray-900 font-montserrat font-medium text-[1.1vw] truncate flex-1 text-right">{item.pelajaran}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <p className="text-gray-500 font-montserrat font-medium text-[1.2vw] uppercase tracking-widest leading-relaxed">
                    TIDAK ADA KELAS<br />SAAT INI
                  </p>
                </div>
              )}

              {/* Pagination Dots */}
              {activeItems.length > ITEMS_PER_PAGE && (
                <div className="mt-auto py-2 flex justify-center gap-1">
                  {Array.from({ length: Math.ceil(activeItems.length / ITEMS_PER_PAGE) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${i === currentPage ? "w-4 bg-[#1e5666]" : "w-1 bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DisplaySidebarLeft;
