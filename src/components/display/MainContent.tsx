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

  // Slider animation for scheduled slider
  useEffect(() => {
    const isSlider = activeSchedule?.contentType === "slider";
    const images = Array.isArray(activeSchedule?.content) ? activeSchedule.content : [];
    
    if (isSlider && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeSchedule]);

  const currentType = activeSchedule ? activeSchedule.contentType : config.contentType;
  const currentContent = activeSchedule 
    ? (Array.isArray(activeSchedule.content) ? activeSchedule.content : [activeSchedule.content as string])
    : (config.contentType === "video" ? [config.videoUrl] : config.sliderImages);

  if (!currentContent || currentContent.length === 0 || !currentContent[0]) {
    return (
      <div className="w-full h-full bg-[var(--greenscreen)] rounded-[calc(var(--radius)-0.3vw)] shadow-inner flex items-center justify-center">
        <p className="text-white/20 font-bold uppercase tracking-tighter text-4xl">Greenscreen Mode</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[var(--greenscreen)] rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner">
      {currentType === "video" ? (
        <iframe
          src={currentContent[0]}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Video Content"
        />
      ) : (
        <div className="absolute inset-0">
          {currentContent.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                i === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {currentContent.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {currentContent.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide ? "bg-white scale-125" : "bg-white/40"
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
