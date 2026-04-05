import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

const MainContent = () => {
  const { config, status, settings } = useDisplay();
  const activeProgram = useVideoSchedule();
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

      {/* Overlay Transition UI (Only if Transition is active) - Keeps the "1 hour ago" aesthetics but as an overlay */}
      {status.activePeriod && isTransition && (
        <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col items-center justify-center pointer-events-none p-6">
          <div className="w-full max-w-4xl bg-black/60 backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="inline-block px-6 py-2 bg-yellow-400 text-[#1a3a3a] rounded-full font-montserrat font-black text-[1.2vw] shadow-xl uppercase tracking-[0.2em]">
              {transitionType}
            </div>

            <h2 className="text-[2.2vw] font-montserrat font-black text-white leading-tight uppercase drop-shadow-lg tracking-tight">
              {getTransitionNote(transitionType)}
            </h2>

            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex flex-col items-center">
                <span className="text-yellow-400/50 text-[0.8vw] font-bold uppercase tracking-widest">Waktu</span>
                <span className="text-white text-[1.5vw] font-black tabular-nums">
                  {status.activePeriod.start_time.substring(0, 5)} - {status.activePeriod.end_time.substring(0, 5)}
                </span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-yellow-400/50 text-[0.8vw] font-bold uppercase tracking-widest">Menuju Selesai</span>
                <span className="text-yellow-400 text-[1.5vw] font-black tabular-nums animate-pulse">
                  {status.countdown}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
