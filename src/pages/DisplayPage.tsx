import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background islamic-pattern p-[1.5vw] gap-[1.5vw]">
      {/* Top Header Row */}
      <div className="flex justify-between items-start drop-shadow-sm">
        <DisplayHeader />
      </div>

      {/* Main Content & Sidebar Row */}
      <div className="flex-1 flex gap-[1.5vw] min-h-0">
        <div className="flex-1 bg-[var(--display-cream)] rounded-[var(--radius)] shadow-md border border-white/50 p-[0.3vw]">
          <MainContent />
        </div>
        <div className="w-[22vw] bg-[var(--display-cream)] rounded-[var(--radius)] shadow-md border border-white/50 p-[0.3vw] flex flex-col">
          <DisplaySidebar />
        </div>
      </div>

      {/* Footer Row */}
      <div className="drop-shadow-sm">
        <DisplayFooter />
      </div>
    </div>
  );
};

export default DisplayPage;
