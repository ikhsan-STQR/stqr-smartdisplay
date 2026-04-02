import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background islamic-pattern p-[0.75vw] gap-[0.75vw]">
      {/* Top Header Row */}
      <div className="flex justify-between items-start drop-shadow-sm">
        <DisplayHeader />
      </div>

      {/* Content Row: Sidebar Left (Remainder) | Main Content (16:9) | Sidebar Right (3:4) */}
      <div className="flex-1 flex gap-[0.75vw] min-h-0">
        <div className="flex-1 bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex flex-col relative overflow-hidden">
          <DisplaySidebarLeft />
        </div>
        <div className="h-full w-auto aspect-[16/9] bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex items-center justify-center overflow-hidden">
          <MainContent />
        </div>
        <div className="w-[22.5vw] bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex flex-col relative overflow-hidden">
          <div className="h-full w-auto aspect-[3/4] mx-auto">
            <DisplaySidebar />
          </div>
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
