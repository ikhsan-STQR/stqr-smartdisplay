import { useState, useEffect } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";

const DisplaySidebarLeft = () => {
  const { config, status } = useDisplay();
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
        <h2 className="text-white font-montserrat font-black text-[1.7vw] uppercase tracking-tighter text-center leading-none whitespace-nowrap">
          {status.activePeriod ? status.activePeriod.name : "TIDAK ADA KEGIATAN"}
        </h2>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 w-full bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col p-2">
        {(() => {
          const active = status.activePeriod;
          const name = active?.name.toUpperCase() || "";
          let instructions = null;

          if (!active || active.type === 'end' || name.includes("PULANG")) {
            instructions = config.customTexts.pulangNotes;
          } else if (name.includes("APEL BERSAMA")) {
            instructions = config.customTexts.apelBersamaNotes;
          } else if (name.includes("APEL PAGI")) {
            instructions = config.customTexts.apelPagiNotes;
          } else if (active.type === 'break' || name.includes("ISTIRAHAT")) {
            instructions = config.customTexts.breakNotes;
          }

          if (instructions) {
            return (
              <div className="flex-1 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl flex flex-col items-center justify-center text-center p-6 animate-in zoom-in fade-in duration-700">
                {active && (
                  <h2 className="text-[#133c47] font-montserrat font-black text-[2vw] mb-4 uppercase tracking-tight border-b-4 border-primary/20 pb-2 px-4">
                    {active.type === 'break' ? config.customTexts.breakTitle : active.name}
                  </h2>
                )}
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
