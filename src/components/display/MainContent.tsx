import { useState, useEffect, useRef } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const MainContent = () => {
  const { config, status, settings } = useDisplay();
  const activeProgram = useVideoSchedule();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const playerRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string>("");

  // Check if we've already interacted in this session
  useEffect(() => {
    const interacted = sessionStorage.getItem('display-interacted');
    if (interacted) setHasInteracted(true);
  }, []);

  const handleInteraction = () => {
    setHasInteracted(true);
    sessionStorage.setItem('display-interacted', 'true');
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
      playerRef.current.unMute();
    }
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

  // Handle YouTube Playlist & Automatic Skipping
  useEffect(() => {
    if (activeProgram.contentType !== "video") return;

    // Load YouTube API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onPlayerReady = (event: any) => {
      if (hasInteracted) {
        event.target.playVideo();
        event.target.unMute();
      }
    };

    const onPlayerStateChange = (event: any) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        // Determine if we are in default mode or schedule mode
        const isDefault = !activeProgram.scheduleName || activeProgram.scheduleName === "DEFAULT (MURROTAL 24H)";
        const playlist = Array.isArray(activeProgram.content) ? activeProgram.content : config.defaultVideoUrls;

        if (isDefault && playlist.length > 1) {
          setCurrentPlaylistIndex((prev) => (prev + 1) % playlist.length);
        } else {
          // If it's a single video (schedule or single default), loop it
          event.target.playVideo();
        }
      }
    };

    const initPlayer = (videoId: string) => {
      // Prevent reloading if same video is already playing AND player is functional
      if (
        currentVideoIdRef.current === videoId && 
        playerRef.current && 
        typeof playerRef.current.loadVideoById === "function"
      ) {
        return;
      }

      currentVideoIdRef.current = videoId;

      // If player already exists and is functional, just load the new video
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
        try {
          playerRef.current.loadVideoById(videoId);
          return;
        } catch (e) {
          console.warn("MainContent: loadVideoById failed, re-initializing player", e);
        }
      }

      // Initialize new player
      try {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            mute: hasInteracted ? 0 : 1
          },
          events: {
            onReady: (event: any) => {
              onPlayerReady(event);
              if (hasInteracted) event.target.unMute();
            },
            onStateChange: onPlayerStateChange,
            onError: (e: any) => {
              console.error("MainContent: YouTube Player Error", e);
              // Clear current ID to allow retry on next check
              currentVideoIdRef.current = "";
            }
          },
        });
      } catch (e) {
        console.error("MainContent: Player creation failed", e);
        currentVideoIdRef.current = "";
      }
    };

    // Helper to extract Video ID - Now more aggressive for malformed inputs
    const getYouTubeId = (url: any) => {
      if (!url || typeof url !== 'string') return "";
      
      // 1. Standard YouTube/Embed Match
      const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/)|youtu\.be\/)([^&?/\s]+)/);
      if (match) return match[1];

      // 2. Extra effort: Match ID if it's inside a "playlist=" parameter (common in mangled URLs)
      const playlistMatch = url.match(/[?&]playlist=([^&?/\s]+)/);
      if (playlistMatch) return playlistMatch[1];
      
      // 3. Last fallback: Check if it's just a raw 11-char ID
      const trimmed = url.trim();
      return trimmed.length === 11 ? trimmed : "";
    };

    // Determine what to play
    let videoToPlay = "";
    const isSchedule = activeProgram.scheduleName && activeProgram.scheduleName !== "DEFAULT (MURROTAL 24H)";
    
    if (isSchedule) {
      const content = activeProgram.content;
      videoToPlay = getYouTubeId(Array.isArray(content) ? content[0] : content);
    } else {
      const playlist = Array.isArray(activeProgram.content) ? activeProgram.content : config.defaultVideoUrls;
      if (playlist && playlist.length > 0) {
        const safeIndex = currentPlaylistIndex % playlist.length;
        videoToPlay = getYouTubeId(playlist[safeIndex]);
      }
    }

    if (!videoToPlay) {
      console.warn("MainContent: Could not determine video ID for", activeProgram.content);
      return;
    }

    if (window.YT && window.YT.Player) {
      initPlayer(videoToPlay);
    } else {
      window.onYouTubeIframeAPIReady = () => initPlayer(videoToPlay);
    }
  }, [activeProgram.scheduleName, activeProgram.contentType, activeProgram.content, currentPlaylistIndex, config.defaultVideoUrls, hasInteracted]);

  const isContentEmpty = activeProgram.contentType === "video" 
    ? (config.defaultVideoUrls.length === 0 && !activeProgram.content)
    : (!activeProgram.content || (Array.isArray(activeProgram.content) && activeProgram.content.length === 0));

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner" onClick={handleInteraction}>
      {isContentEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-black p-[4vw] text-center">
          {config.organization_logo ? (
            <img src={config.organization_logo} alt="Logo" className="w-[12vw] h-[12vw] object-contain mb-[2vw] drop-shadow-2xl" />
          ) : (
            <div className="w-[12vw] h-[12vw] bg-white/5 rounded-full flex items-center justify-center mb-[2vw] border border-white/10">
               <span className="text-[5vw]">🏫</span>
            </div>
          )}
          <h1 className="text-white font-montserrat font-black text-[3.5vw] uppercase tracking-tighter leading-tight max-w-[80%]">
            {config.organization_name || "STQ Riyadhussholihiin"}
          </h1>
          <div className="w-[10vw] h-[0.5vh] bg-primary my-[1.5vw] rounded-full" />
          <p className="text-white/40 font-jakarta font-bold text-[1.2vw] uppercase tracking-[0.3em]">
            Digital Information System
          </p>
        </div>
      ) : activeProgram.contentType === "video" ? (
        <div className="absolute inset-0">
          <div id="youtube-player" className="w-full h-full pointer-events-none" />
          
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
