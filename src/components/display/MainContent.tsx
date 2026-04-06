import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

const MainContent = () => {
  const { config, status, settings } = useDisplay();
  const activeProgram = useVideoSchedule();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider animation for slider content (independent of source)
  useEffect(() => {
    if (activeProgram.contentType === "slider" && (activeProgram.content as string[]).length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (activeProgram.content as string[]).length);
      }, (config.announcementInterval || 5) * 1000);
      return () => clearInterval(timer);
    }
  }, [activeProgram.contentType, activeProgram.content, config.announcementInterval]);

  const getEnhancedVideoUrl = (url: string) => {
    if (!url) return "";

    const videoIdMatch = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/)|youtu\.be\/)([^&?/\s]+)/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;
    }

    if (url.includes('/embed/')) return `${url.split('?')[0]}?autoplay=1&mute=1&loop=1&controls=0`;
    if (url.length === 11) return `https://www.youtube.com/embed/${url}?autoplay=1&mute=1&loop=1&playlist=${url}&controls=0`;

    return url;
  };

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner">
      {/* Background Content: Video or Slider */}
      {activeProgram.contentType === "video" ? (
        <iframe
          src={getEnhancedVideoUrl(activeProgram.content as string)}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Video Content"
        />
      ) : (
        <div className="absolute inset-0">
          {((activeProgram.content as string[]) || []).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
          {((activeProgram.content as string[])?.length || 0) > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {(activeProgram.content as string[]).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white scale-125" : "bg-white/40"
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
