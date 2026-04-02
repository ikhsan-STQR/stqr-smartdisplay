import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";
import DisplayPrayerTimes from "@/components/display/DisplayPrayerTimes";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background islamic-pattern p-[0.75vw] gap-[0.75vw]">
      {/* Top Header Row - Flexible to absorb vertical space change */}
      <div className="flex-shrink flex justify-between items-start drop-shadow-sm min-h-0 overflow-hidden">
        <DisplayHeader />
      </div>

      {/* Content Row: Sidebar Left (Remainder) | Main Content (16:9) | Sidebar Right (3:4) */}
      <div className="flex-1 flex gap-[0.5vw] min-h-0 px-[0.5vw]">
        <div className="flex-1 min-w-[15%] bg-white rounded-xl shadow-md p-[0.5vw] flex flex-col relative overflow-hidden">
          <DisplaySidebarLeft />
        </div>
        <div className="h-full aspect-video shrink-0 overflow-hidden flex items-center justify-center">
          <MainContent />
        </div>
        <div className="w-[22%] bg-white rounded-xl shadow-md p-0 flex flex-col relative overflow-hidden shrink-0">
           <DisplaySidebar />
        </div>
      </div>

      {/* Footer Row */}
      <div className="shrink-0 drop-shadow-sm">
        <DisplayFooter />
      </div>

      {/* New Prayer Row */}
      <DisplayPrayerTimes />
    </div>
  );
};

export default DisplayPage;
