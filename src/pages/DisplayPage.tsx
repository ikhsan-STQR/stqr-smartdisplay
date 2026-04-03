import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebarLeft from "@/components/display/DisplaySidebarLeft";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";
import DisplayPrayerTimes from "@/components/display/DisplayPrayerTimes";

const DisplayPage = () => {
  const { isLoading } = useDisplay();
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isMob = width < 1024;
      setIsMobile(isMob);
      
      if (isMob) {
        // Force a stable 1280px internal width for the mobile scale-down
        setScale(width / 1280);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background islamic-pattern flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // The Original Comprehensive Layout Logic
  const renderLayout = (isScaled: boolean) => (
    <div className={`
      ${isScaled ? 'w-[1280px] h-[720px]' : 'h-screen w-screen'} 
      flex flex-col overflow-hidden bg-background islamic-pattern p-[0.75vw] gap-[0.75vw]
    `}>
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
  );

  // Desktop (>= 1024px): Return the normal fullscreen layout
  if (!isMobile) {
    return renderLayout(false);
  }

  // Mobile (< 1024px): Wrap in a scaling-optimized container
  return (
    <div className="h-screen w-screen bg-gray-900 overflow-hidden relative">
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left',
          width: '1280px',
          height: `${window.innerHeight / scale}px` // Ensure full height coverage
        }}
        className="absolute top-0 left-0"
      >
        {renderLayout(true)}
      </div>
    </div>
  );
};

export default DisplayPage;
