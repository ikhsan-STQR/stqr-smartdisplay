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
      const height = window.innerHeight;
      const isMob = width < 1024;
      setIsMobile(isMob);
      
      if (isMob) {
        // Target a stable internal height of 720px for perfect vertical fitting (no scroll)
        setScale(height / 720);
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
      ${isScaled ? 'w-[1280px] h-[720px] justify-between py-[1vw]' : 'h-screen w-screen p-[0.75vw]'} 
      flex flex-col overflow-hidden bg-background islamic-pattern gap-[0.75vw]
    `}>
      {/* Top Header Row - Fixed Columns aligned with content below */}
      <div className={`shrink-0 px-[0.5vw] ${isScaled ? 'flex-1 flex flex-col justify-center' : ''}`}>
        <DisplayHeader isMobile={isScaled} />
      </div>

      {/* Content Row: Sidebar Left (22%) | Main Content (58%) | Sidebar Right (20%) */}
      <div className={`shrink-0 flex gap-[0.5vw] px-[0.5vw] items-stretch justify-center ${isScaled ? 'h-auto' : 'flex-1 min-h-0'}`}>
        <div className="w-[22%] bg-white rounded-xl shadow-md p-[0.5vw] flex flex-col relative overflow-hidden shrink-0">
          <DisplaySidebarLeft isMobile={isScaled} />
        </div>
        <div className={`flex-1 min-w-0 flex items-center justify-center overflow-hidden ${isScaled ? 'max-w-[58%] aspect-video' : ''}`}>
          <div className="w-full aspect-video shadow-2xl rounded-xl overflow-hidden bg-black">
            <MainContent />
          </div>
        </div>
        <div className="w-[20%] bg-white rounded-xl shadow-md p-0 flex flex-col relative overflow-hidden shrink-0">
          <DisplaySidebar isMobile={isScaled} />
        </div>
      </div>

      {/* Footer Row & Prayer Times - Combined for Mobile Expansion Space */}
      <div className={`shrink-0 flex flex-col ${isScaled ? 'flex-1 justify-center gap-[1.5vw]' : 'gap-[0.75vw]'}`}>
        <div className="shrink-0 drop-shadow-sm px-[0.5vw]">
          <DisplayFooter />
        </div>
        <DisplayPrayerTimes isMobile={isScaled} />
      </div>
    </div>
  );

  // Desktop (>= 1024px): Return the normal fullscreen layout
  if (!isMobile) {
    return renderLayout(false);
  }

  // Mobile (< 1024px): Wrap in a fixed 1280x720 Virtual Canvas scaled to fit device HEIGHT (non-scrollable)
  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center overflow-hidden relative">
      <div 
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
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
