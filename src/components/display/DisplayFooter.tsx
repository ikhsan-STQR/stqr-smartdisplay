import { useDisplay } from "@/context/DisplayContext";

const DisplayFooter = () => {
  const { config } = useDisplay();

  return (
    <footer className="flex items-center gap-[1.5vw] bg-transparent h-[8vh]">
      {/* Dalil Hari Ini Label */}
      <div className="flex-shrink-0">
        <span className="text-[var(--display-olive)] font-barlow font-black text-[2.2vw] uppercase tracking-tight">
          Dalil Hari Ini
        </span>
      </div>

      {/* Running Text Bar (Greenscreen) */}
      <div className="flex-1 h-full bg-[var(--greenscreen)] rounded-[1vw] overflow-hidden flex items-center shadow-inner">
        <div
          className="animate-marquee whitespace-nowrap font-barlow text-primary text-[2vw] font-bold px-[2vw]"
          style={{ animationDuration: `${config.runningTextSpeed || 30}s` }}
        >
          {config.runningText}
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;