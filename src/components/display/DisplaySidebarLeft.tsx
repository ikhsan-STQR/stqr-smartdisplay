import { useState, useEffect } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";

const DisplaySidebarLeft = ({ isMobile }: { isMobile?: boolean }) => {
  const { config, status, settings, timetable } = useDisplay();
  const [activeItems, setActiveItems] = useState<ScheduleItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = isMobile ? 6 : 7;

  useEffect(() => {
    const updateActiveSchedule = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hh}:${mm}`;
      const daysOrder = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const currentDayName = daysOrder[now.getDay()];

      // Filter from the new timetable system
      const filtered = timetable
        .filter(entry => 
          entry.mode === settings.active_mode && 
          (entry.day || "").toString().trim().toUpperCase() === currentDayName.toUpperCase() &&
          currentTime >= entry.start_time.substring(0, 5) && 
          currentTime < entry.end_time.substring(0, 5)
        )
        .map(entry => ({
          kelas: entry.rombel || "-",
          pelajaran: entry.subject_name || "-",
          startTime: entry.start_time,
          endTime: entry.end_time
        }));

      setActiveItems(filtered);
    };

    updateActiveSchedule();
    const interval = setInterval(updateActiveSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [timetable, settings.active_mode]);

  useEffect(() => {
    if (activeItems.length > ITEMS_PER_PAGE) {
      const pageInterval = setInterval(() => {
        setCurrentPage((prev) => (prev + 1) % Math.ceil(activeItems.length / ITEMS_PER_PAGE));
      }, 8000); // Cycle every 8 seconds
      return () => clearInterval(pageInterval);
    } else {
      setCurrentPage(0);
    }
  }, [activeItems.length, ITEMS_PER_PAGE]);

  const displayedItems = activeItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className={`flex-1 flex flex-col ${isMobile ? 'gap-[0.3vw]' : 'gap-[0.5vw]'} h-full overflow-hidden w-full transition-colors duration-500`}>
      {/* Status Box - Simplified Single Line */}
      <div 
        className={`w-full rounded-xl px-[2vw] ${isMobile ? 'py-[0.8vw] min-h-[6vh]' : 'py-[1.2vw] min-h-[8vh]'} shadow-lg border border-white/10 flex items-center justify-center shrink-0 transition-colors duration-500`}
        style={{ backgroundColor: config.left_title_bg || config.text_color_main || "#133c47" }}
      >
        <h2 
          className={`font-montserrat font-black ${isMobile ? 'text-[1.2vw]' : 'text-[1.5vw]'} uppercase tracking-tight text-center leading-none whitespace-nowrap transition-colors duration-500`}
          style={{ color: config.left_title_text || "#EAB308" }}
        >
          {(() => {
            if (!status.activePeriod) return "TIDAK ADA KEGIATAN";
            
            // Priority: Description (Column H) -> Period (Column F) -> Subject
            let p = status.activePeriod.description && status.activePeriod.description !== "-" 
              ? status.activePeriod.description 
              : (status.activePeriod.period && status.activePeriod.period !== "-" ? status.activePeriod.period : "");
            
            if (p) {
              // Strip extra details like "(60 Menit)" from the title
              p = p.split('(')[0].trim();
              
              // If it's just numbers like "1-2", prefix with "JP"
              const displayPeriod = /^\d/.test(p) && !p.toUpperCase().includes("JP") ? `JP ${p}` : p;
              return displayPeriod.toUpperCase();
            }
            
            return status.activePeriod.subject_name !== "-" 
              ? status.activePeriod.subject_name.toUpperCase()
              : "JADWAL PELAJARAN";
          })()}
        </h2>
      </div>

      {/* Sidebar Content Area */}
      <div className={`flex-1 w-full bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col ${isMobile ? 'p-1' : 'p-2'}`}>
        {(() => {
          const active = status.activePeriod;
          if (!active) {
            const today = new Date().getDay(); // 0: Ahad, 4: Kamis, 5: Jumat, 6: Sabtu
            // Sunday is now a school day, so we adjust the weekend check
            const isWeekendOrThursday = today === 4 || today === 5 || today === 6;
            
            return (
              <div className={`flex-1 flex flex-col items-center justify-center text-center ${isMobile ? 'p-4' : 'p-8'} bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm animate-in fade-in zoom-in duration-1000`}>
                <div 
                  className={`${isMobile ? 'w-12 h-12 mb-3' : 'w-20 h-20 mb-6'} rounded-full flex items-center justify-center transition-colors duration-500`}
                  style={{ backgroundColor: `${config.left_content_text || config.text_color_main || "#1a3a3a"}10` }} // 10% opacity
                >
                  <span className={isMobile ? 'text-2xl' : 'text-4xl'}>👋</span>
                </div>
                <h2 
                  className={`font-montserrat font-black ${isMobile ? 'text-[1.6vw] mb-2' : 'text-[2vw] mb-4'} leading-tight uppercase tracking-tighter transition-colors duration-500`}
                  style={{ color: config.left_content_text || config.text_color_main || "#1a3a3a" }}
                >
                  {isWeekendOrThursday ? "Sampai Jumpa Hari Ahad" : "Sampai Jumpa Esok Hari"}
                </h2>
                <p className={`text-gray-500 font-jakarta font-bold ${isMobile ? 'text-[0.8vw]' : 'text-[1vw]'} uppercase tracking-[0.2em] opacity-80 transition-colors duration-500`}>
                  Dengan Semangat Belajar Baru
                </p>
                
                {/* Decorative Pattern at bottom */}
                {!isMobile && (
                  <div className="mt-8 opacity-10">
                     <div className="flex gap-2">
                       {[1,2,3].map(i => (
                         <div 
                           key={i} 
                           className="w-2 h-2 rounded-full transition-colors duration-500" 
                           style={{ backgroundColor: config.left_content_text || config.text_color_main || "#1a3a3a" }}
                         />
                       ))}
                     </div>
                  </div>
                )}
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
              <div className={`flex-1 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm rounded-xl flex flex-col items-center justify-center text-center ${isMobile ? 'p-3' : 'p-6'} animate-in zoom-in fade-in duration-700 transition-colors duration-500`}>
                <h2 
                  className={`font-montserrat font-black ${isMobile ? 'text-[1.6vw] mb-2' : 'text-[2vw] mb-4'} uppercase tracking-tight border-b-4 pb-2 px-4 shadow-sm text-center w-full transition-colors duration-500`}
                  style={{ 
                    color: config.left_content_text || config.text_color_main || "#133c47",
                    borderBottomColor: `${config.primary_color || "#8b7336"}40`
                  }}
                >
                  {active.subject_name !== "-" ? active.subject_name : (active.description || active.period)}
                </h2>
                <div 
                  className={`font-jakarta font-black ${isMobile ? 'text-[1.2vw] leading-[1.5]' : 'text-[1.4vw] leading-[1.8]'} uppercase whitespace-pre-line text-center max-w-[95%] tracking-wide transition-colors duration-500`}
                  style={{ color: config.left_content_text || "rgb(55 65 81)" }}
                >
                  {instructions}
                </div>
              </div>
            );
          }

          /* Normal Class Schedule List */
          return (
            <div className="h-full flex flex-col transition-colors duration-500">
              {activeItems.length > 0 ? (
                <div
                  className={`w-full flex-1 flex flex-col ${isMobile ? 'gap-1' : 'gap-2'} transition-opacity duration-500 ease-in-out`}
                  key={currentPage}
                >
                  {displayedItems.map((item, i) => (
                    <div key={i} className={`flex justify-between items-center bg-white rounded-lg ${isMobile ? 'px-3 py-1' : 'px-4 py-2'} shadow-sm border border-gray-100 animate-in fade-in duration-500 transition-colors duration-500`}>
                      <span 
                        className={`font-montserrat font-black ${isMobile ? 'text-[1vw] w-[3.5vw]' : 'text-[1.2vw] w-[4vw]'} shrink-0 transition-colors duration-500`}
                        style={{ color: config.primary_color || "#1e5666" }}
                      >
                        {item.kelas}
                      </span>
                      <span 
                        className={`font-montserrat font-medium ${isMobile ? 'text-[0.9vw]' : 'text-[1.1vw]'} truncate flex-1 text-right transition-colors duration-500`}
                        style={{ color: config.left_content_text || "rgb(17 24 39)" }}
                      >
                        {item.pelajaran}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <p 
                    className="font-montserrat font-medium text-[1.2vw] uppercase tracking-widest leading-relaxed text-center w-full transition-colors duration-500"
                    style={{ color: config.left_content_text || "rgb(107 114 128)" }}
                  >
                    TIDAK ADA KELAS<br />SAAT INI
                  </p>
                </div>
              )}

              {/* Pagination Dots */}
              {activeItems.length > ITEMS_PER_PAGE && (
                <div className={`mt-auto ${isMobile ? 'py-1' : 'py-2'} flex justify-center gap-1`}>
                  {Array.from({ length: Math.ceil(activeItems.length / ITEMS_PER_PAGE) }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: i === currentPage ? "1rem" : "0.25rem",
                        backgroundColor: i === currentPage ? (config.primary_color || "#1e5666") : "rgb(209 213 219)"
                      }}
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
