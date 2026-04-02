import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayClock from "@/components/display/DisplayClock";
import DisplayFooter from "@/components/display/DisplayFooter";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background islamic-pattern p-[0.75vw] gap-[0.75vw]">
      {/* Top Header Row */}
      <div className="h-[12vh] flex-shrink-0">
        <DisplayHeader />
      </div>

      {/* Main 3-Column Area: Left (Remainder) | Middle (16:9 Video) | Right (Clock & Poster) */}
      <div className="flex-1 flex gap-[0.75vw] min-h-0">
        {/* Left Sidebar - Auto-Expand */}
        <div className="flex-1 bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex flex-col relative overflow-hidden">
          <DisplaySidebarLeft />
        </div>

        {/* Middle Column - STRICT 16:9 */}
        <div className="h-full aspect-video shrink-0 bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex items-center justify-center overflow-hidden">
          <MainContent />
        </div>

        {/* Right Sidebar - Fixed Width & Rigid Flex */}
        <div className="w-[20%] shrink-0 flex flex-col gap-[0.75vw]">
          <DisplayClock />
          <div className="flex-1 bg-[var(--display-cream)] rounded-[var(--radius)] shadow-lg border border-white/50 p-[0.3vw] flex flex-col relative overflow-hidden">
            <div className="h-full w-full flex flex-col">
              <DisplaySidebar />
            </div>
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
