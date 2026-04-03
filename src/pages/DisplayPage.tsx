import { useDisplay } from "@/context/DisplayContext";
import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";
import DisplayPrayerTimes from "@/components/display/DisplayPrayerTimes";

const DisplayPage = () => {
  const { isLoading } = useDisplay();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background islamic-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Strict 16:9 Display Wrapper */}
      <div className="w-full max-w-[calc(100vh*(16/9))] max-h-[calc(100vw*(9/16))] aspect-video relative bg-background islamic-pattern overflow-hidden flex flex-col p-[0.75vw] gap-[0.75vw] shadow-2xl">
        {/* Top Header Row - Fixed Columns aligned with content below */}
        <div className="shrink-0 px-[0.5vw]">
          <DisplayHeader />
        </div>

        {/* Content Row: Sidebar Left (Remainder) | Main Content (16:9) | Sidebar Right (3:4) */}
        <div className="flex-1 flex gap-[0.5vw] min-h-0 px-[0.5vw]">
          <div className="w-[22%] bg-white rounded-xl shadow-md p-[0.5vw] flex flex-col relative overflow-hidden shrink-0">
            <DisplaySidebarLeft />
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden">
            <div className="w-full aspect-video shadow-2xl rounded-xl overflow-hidden bg-black">
              <MainContent />
            </div>
          </div>
          <div className="w-[20%] bg-white rounded-xl shadow-md p-0 flex flex-col relative overflow-hidden shrink-0">
            <DisplaySidebar />
          </div>
        </div>

        {/* Footer Row - Synced padding with content row */}
        <div className="shrink-0 drop-shadow-sm px-[0.5vw]">
          <DisplayFooter />
        </div>

        {/* New Prayer Row */}
        <DisplayPrayerTimes />
      </div>
    </div>
  );
};

export default DisplayPage;
