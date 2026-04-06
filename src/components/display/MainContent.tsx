import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

const MainContent = () => {
  const { config, status, settings } = useDisplay();
  const activeProgram = useVideoSchedule();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Check if we've already interacted in this session
  useEffect(() => {
    const interacted = sessionStorage.getItem('display-interacted');
    if (interacted) setHasInteracted(true);
  }, []);

  const handleInteraction = () => {
    setHasInteracted(true);
    sessionStorage.setItem('display-interacted', 'true');
  };

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

    const origin = window.location.origin;
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/)|youtu\.be\/)([^&?/\s]+)/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&enablejsapi=1&origin=${origin}`;
    }

    if (url.includes('/embed/')) return `${url.split('?')[0]}?autoplay=1&mute=0&loop=1&controls=0&enablejsapi=1&origin=${origin}`;
    if (url.length === 11) return `https://www.youtube.com/embed/${url}?autoplay=1&mute=0&loop=1&playlist=${url}&controls=0&enablejsapi=1&origin=${origin}`;

    return url;
  };

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner" onClick={handleInteraction}>
      {/* Background Content: Video or Slider */}
      {activeProgram.contentType === "video" ? (
        <div className="absolute inset-0">
          <iframe
            src={getEnhancedVideoUrl(activeProgram.content as string)}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title="Video Content"
          />
          
          {/* Subtle Activation Overlay - only if haven't interacted yet */}
          {!hasInteracted && (
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-50 animate-in fade-in duration-500"
              onClick={handleInteraction}
            >
              <div className="bg-white/10 border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl text-center space-y-2 shadow-2xl hover:bg-white/20 transition-all transform hover:scale-105 active:scale-95">
                <div className="text-[2.5vw] animate-bounce">👆</div>
                <h3 className="text-white font-montserrat font-black text-[1.2vw] uppercase tracking-widest">Klik Untuk Aktifkan Video & Suara</h3>
                <p className="text-white/60 font-jakarta font-bold text-[0.8vw] uppercase tracking-tight italic">Optimasi Playback Smart Display</p>
              </div>
            </div>
          )}
        </div>
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
