import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

const MainContent = () => {
  const { config, status, settings } = useDisplay();
  const [currentSlide, setCurrentSlide] = useState(0);

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
    if (config.contentType === "slider" && config.sliderImages?.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % config.sliderImages.length);
      }, (config.announcementInterval || 5) * 1000);
      return () => clearInterval(timer);
    }
  }, [config.contentType, config.sliderImages, config.announcementInterval]);

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

  const getEnhancedVideoUrl = (url: string) => {
    if (!url) return "";

    // Robustly extract Video ID from any standard YouTube link (Watch, Embed, Short, or Live)
    // Examples: https://www.youtube.com/watch?v=ID, https://youtu.be/ID, https://www.youtube.com/embed/ID, https://www.youtube.com/live/ID
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/)|youtu\.be\/)([^&?/\s]+)/);

    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      // Construct a clean embed URL with all mandatory signage parameters
      // loop=1 + playlist={videoId} is required for YouTube looping
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;
    }

    // Fallback: If it's already an embed link (starts with /embed/) but missing params, or if it's just an ID
    if (url.includes('/embed/')) return `${url.split('?')[0]}?autoplay=1&mute=1&loop=1&controls=0`;
    if (url.length === 11) return `https://www.youtube.com/embed/${url}?autoplay=1&mute=1&loop=1&playlist=${url}&controls=0`;

    return url;
  };

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner">
      {config.contentType === "video" ? (
        <iframe
          src={getEnhancedVideoUrl(config.videoUrl)}
          className="absolute inset-0 w-full h-full border-0 pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Video Content"
        />
      ) : (
        <div className="absolute inset-0">
          {(config.sliderImages || []).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Slide ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
          {(config.sliderImages?.length || 0) > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {config.sliderImages.map((_, i) => (
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
