import { useDisplay } from "@/context/DisplayContext";

const DisplayFooter = () => {
  const { config } = useDisplay();

  return (
    <footer className="flex items-stretch" style={{ backgroundColor: "hsl(45, 60%, 90%)" }}>
      {/* Dalil Hari Ini Label */}
      <div className="bg-orange px-4 py-2 flex items-center flex-shrink-0">
        <span className="text-primary-foreground font-barlow font-black text-[12pt] uppercase tracking-wide">
          Dalil Hari Ini
        </span>
      </div>

      {/* Running Text */}
      <div className="flex-1 overflow-hidden flex items-center">
        <div
          className="animate-marquee whitespace-nowrap font-barlow text-primary text-[14pt] font-medium px-4"
          style={{ animationDuration: `${config.runningTextSpeed || 30}s` }}
        >
          {config.runningText}
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;