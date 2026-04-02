import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col p-[2vh] gap-[2vh] overflow-hidden bg-[#f5f5f5] font-barlow">
      {/* 1. Header Area (14% Height) */}
      <div className="h-[14vh] flex items-center justify-between px-[1vw] z-10">
        <DisplayHeader />
      </div>

      {/* 2. Content Area (72% Height) */}
      <div className="h-[72vh] flex gap-[2vw] px-[1vw] z-10">
        {/* Main 16:9 Frame (Left - 72% Width) */}
        <div className="w-[72%] h-full flex flex-col justify-center">
          <MainContent />
        </div>

        {/* Sidebar Frame (Right - 28% Width) */}
        <div className="w-[28%] h-full flex flex-col">
          <DisplaySidebar />
        </div>
      </div>

      {/* 3. Footer Area (12% Height) */}
      <div className="h-[12vh] flex flex-col justify-end z-20">
        <DisplayFooter />
      </div>

      {/* Absolute Radial Highlight for "Overlay" Depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.02)_100%)]" />
    </div>
  );
};

export default DisplayPage;
