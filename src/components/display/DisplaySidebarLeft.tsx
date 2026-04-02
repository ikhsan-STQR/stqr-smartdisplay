import { useDisplay } from "@/context/DisplayContext";

const DisplaySidebarLeft = () => {
  const { config } = useDisplay();

  return (
    <div className="w-full h-full flex flex-col gap-[1vw]">
      {/* Title Banner */}
      <div className="bg-[var(--display-olive)] px-[1vw] py-[0.8vh] rounded-[0.6vw] text-center shadow-sm">
        <span className="text-white font-barlow font-bold text-[1.4vw] uppercase tracking-wider">
          Jadwal Pelajaran
        </span>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 bg-[var(--greenscreen)] rounded-[var(--radius)] shadow-inner relative overflow-hidden flex items-center justify-center p-4">
          <div className="w-full h-full flex flex-col gap-2 overflow-hidden">
            {config.jadwalPelajaran.slice(0, 8).map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 rounded px-2 py-1 border border-white/5">
                <span className="text-white font-bold text-[1vw]">{item.kelas}</span>
                <span className="text-white text-[0.9vw] truncate flex-1 mx-2">{item.pelajaran}</span>
                <span className="text-white/80 font-mono text-[0.8vw]">{item.waktu}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default DisplaySidebarLeft;
