import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

const MainContent = () => {
  const { status, settings } = useDisplay();
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeProgram = useVideoSchedule();

  // Status for current active period (KBM Transition)
  const isTransition = status.activePeriod?.subject_name === "-" || !status.activePeriod?.subject_name;
  const transitionType = status.activePeriod?.description || status.activePeriod?.period || "";
  
  const getTransitionNote = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("istirahat")) return settings.note_istirahat;
    if (t.includes("apel pagi")) return settings.note_apel_pagi;
    if (t.includes("apel bersama")) return settings.note_apel_bersama;
    if (t.includes("pulang")) return settings.note_pulang;
    return status.activePeriod?.description || "";
  };

  // Slider animation for slider content (independent of source)
  useEffect(() => {
    const isSlider = activeProgram.contentType === "slider";
    const images = Array.isArray(activeProgram.content) ? activeProgram.content : [];
    
    if (isSlider && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeProgram]);

  // If in Transition Mode (Break/Apel/etc)
  if (status.activePeriod && isTransition) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1a3a3a] via-[#133c47] to-[#1a3a3a] rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-2xl flex flex-col items-center justify-center p-10 text-center border-[0.5vw] border-white/5">
        <div className="absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-block px-8 py-3 bg-yellow-400 text-[#1a3a3a] rounded-full font-montserrat font-black text-[1.8vw] shadow-xl uppercase tracking-[0.2em] mb-4">
            {transitionType}
          </div>
          
          <h2 className="text-[3.5vw] font-montserrat font-black text-white leading-tight uppercase drop-shadow-lg tracking-tighter">
            {getTransitionNote(transitionType)}
          </h2>

          <div className="flex items-center justify-center gap-10 mt-10">
            <div className="flex flex-col items-center">
              <span className="text-yellow-400/50 text-[1vw] font-bold uppercase tracking-widest">Waktu</span>
              <span className="text-white text-[2.5vw] font-black tabular-nums">
                {status.activePeriod.start_time.substring(0, 5)} - {status.activePeriod.end_time.substring(0, 5)}
              </span>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-yellow-400/50 text-[1vw] font-bold uppercase tracking-widest">Menuju Selesai</span>
              <span className="text-yellow-400 text-[2.5vw] font-black tabular-nums animate-pulse">
                {status.countdown}
              </span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-400/20" />
      </div>
    );
  }

  const currentType = activeProgram.contentType;
  const currentContent = Array.isArray(activeProgram.content) ? activeProgram.content : [activeProgram.content];

  if (!currentContent || currentContent.length === 0 || !currentContent[0]) {
    return (
      <div className="w-full h-full bg-[#1a4a58] rounded-[calc(var(--radius)-0.3vw)] shadow-inner flex items-center justify-center">
        <p className="text-white/20 font-bold uppercase tracking-tighter text-[2vw]">Greenscreen Mode</p>
      </div>
    );
  }

  const getEnhancedVideoUrl = (url: string) => {
    if (!url) return url;
    
    // Robustly extract Video ID from any standard YouTube link (Watch, Embed, or Short)
    const embedMatch = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/live\/)([^&?/\s]+)/);
    if (embedMatch) {
      const videoId = embedMatch[1];
      // Construct a clean embed URL with all professional digital signage parameters
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3`;
    }
    
    return url;
  };

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner">
      {currentType === "video" ? (
        <iframe
          src={getEnhancedVideoUrl(currentContent[0])}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
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
