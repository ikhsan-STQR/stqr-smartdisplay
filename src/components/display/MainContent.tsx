import { useState, useEffect } from "react";
import { useDisplay, ContentSchedule } from "@/context/DisplayContext";

const MainContent = () => {
  const { config } = useDisplay();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSchedule, setActiveSchedule] = useState<ContentSchedule | null>(null);

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const currentDay = now.getDay();

      const active = config.schedules.find(s => 
        s.isActive && 
        s.type === "main" && 
        s.days.includes(currentDay) &&
        currentTime >= s.startTime && 
        currentTime < s.endTime
      );
      
      setActiveSchedule(active || null);
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [config.schedules]);

  // Slider animation logic
  useEffect(() => {
    const images = activeSchedule 
      ? (activeSchedule.contentType === "slider" ? (Array.isArray(activeSchedule.content) ? activeSchedule.content : []) : [])
      : (config.contentType === "slider" ? config.sliderImages : []);
    
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    } else {
      setCurrentSlide(0);
    }
  }, [activeSchedule, config.contentType, config.sliderImages]);

  const isVideo = activeSchedule ? activeSchedule.contentType === "video" : config.contentType === "video";
  const contentItems = activeSchedule 
    ? (Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content as string])
    : (config.contentType === "video" ? [config.videoUrl] : config.sliderImages);

  const videoUrl = isVideo ? contentItems[0] : "";

  return (
    <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 font-barlow group">
      {/* 1. Subtle Inner Frame Border (Layout 02 detail) */}
      <div className="absolute inset-[1px] border border-white/20 rounded-[inherit] z-20 pointer-events-none" />

      {isVideo ? (
        <div className="absolute inset-0 w-full h-full bg-black">
          <iframe
            key={videoUrl}
            src={videoUrl}
            className="w-full h-full border-none object-cover scale-[1.01]"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Main Video Content"
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          {contentItems.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {contentItems.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
              {contentItems.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${
                    i === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainContent;
