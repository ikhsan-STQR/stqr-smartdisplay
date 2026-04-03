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
        // Target a stable internal width of 1280px for perfect desktop-like interpolation
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

  // Mobile (< 1024px): Wrap in a fixed 1280x720 Virtual Canvas scaled to fit device width
  return (
    <div 
      className="w-screen bg-gray-900 flex flex-col items-center justify-start overflow-hidden relative"
      style={{ minHeight: `${720 * scale}px` }}
    >
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          width: '1280px',
          height: '720px',
          flexShrink: 0
        }}
        className="relative shadow-2xl"
      >
        {renderLayout(true)}
      </div>
    </div>
  );
};

export default DisplayPage;
