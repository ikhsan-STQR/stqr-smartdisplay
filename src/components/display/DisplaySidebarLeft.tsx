import { useState, useEffect } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";

const DisplaySidebarLeft = () => {
  const { config } = useDisplay();
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
    <div className="w-full h-full flex flex-col gap-[1vw]">
      {/* Title Banner */}
      <div className="bg-transparent border-b border-gray-100 pb-[1vh] text-center overflow-hidden">
        <span className="text-[#1e5666] font-montserrat font-black text-[1.45vw] uppercase tracking-tighter whitespace-nowrap inline-block w-full">
          Jadwal Pelajaran
        </span>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 bg-gray-50/50 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2">
        {activeItems.length > 0 ? (
          <div 
            className="w-full h-full flex flex-col gap-2 transition-opacity duration-500 ease-in-out"
            key={currentPage} // Forces re-mount for simple fade or use separate state for transition if needed
          >
            {displayedItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 animate-in fade-in duration-500">
                <span className="text-[#1e5666] font-montserrat font-black text-[1.2vw] w-[4vw] shrink-0">{item.kelas}</span>
                <span className="text-gray-900 font-montserrat font-medium text-[1.1vw] truncate flex-1 text-right">{item.pelajaran}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-center p-4">
            <p className="text-gray-500 font-montserrat font-medium text-[1.2vw] uppercase tracking-widest leading-relaxed">
              WAKTU ISTIRAHAT /<br />TIDAK ADA KELAS
            </p>
          </div>
        )}

        {/* Pagination Dots */}
        {activeItems.length > ITEMS_PER_PAGE && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {Array.from({ length: Math.ceil(activeItems.length / ITEMS_PER_PAGE) }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentPage ? "w-4 bg-[#1e5666]" : "w-1 bg-gray-300"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplaySidebarLeft;
