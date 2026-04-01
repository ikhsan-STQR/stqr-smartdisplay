import { useDisplay } from "@/context/DisplayContext";

const DisplayFooter = () => {
  const { config } = useDisplay();

  return (
    <footer className="flex items-stretch bg-gold-light/30 border-t-2 border-gold">
      {/* Dalil Hari Ini Label */}
      <div className="bg-orange px-4 py-2 flex items-center flex-shrink-0">
        <span className="text-primary-foreground font-poppins font-black text-sm uppercase tracking-wide">
          Dalil Hari Ini
        </span>
      </div>

      {/* Running Text */}
      <div className="flex-1 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap font-amiri text-teal text-base font-bold px-4">
          {config.runningText}
        </div>
      </div>
    </footer>
  );
};

export default DisplayFooter;
