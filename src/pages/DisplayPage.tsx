import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";
import DisplayPrayerTimes from "@/components/display/DisplayPrayerTimes";

const DisplayPage = () => {
  return (
    <div className="h-screen w-full min-h-screen overflow-hidden bg-background islamic-pattern p-[0.75vw] gap-[0.75vw] flex flex-col">
      {/* Top Header Row */}
      <div className="flex-shrink flex justify-between items-start drop-shadow-sm min-h-0 overflow-hidden">
        <DisplayHeader />
      </div>

      {/* Content Row: Sidebar Left | Main Content (16:9) | Sidebar Right */}
      <div className="flex-1 flex w-full max-w-full overflow-hidden gap-[0.5vw] min-h-0 px-[0.5vw]">
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-md p-[0.5vw] flex flex-col relative overflow-hidden">
          <DisplaySidebarLeft />
        </div>
        <div className="flex-1 aspect-video min-w-0 shrink-0 overflow-hidden flex items-center justify-center">
          <MainContent />
        </div>
        <div className="w-[22%] shrink-0 bg-white rounded-xl shadow-md p-0 flex flex-col relative overflow-hidden">
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
