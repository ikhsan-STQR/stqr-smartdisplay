import { useState, useEffect, useRef, memo, useCallback, forwardRef, useImperativeHandle } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const extractYouTubeId = (url: any) => {
  if (!url || typeof url !== 'string') return "";
  const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/)|youtu\.be\/)([^&?/\s]{11})/);
  if (match) return match[1];
  const trimmed = url.trim();
  return trimmed.length === 11 ? trimmed : "";
};

// Dedicated VideoPlayer component - Stable version with key-based remounting
const VideoPlayer = memo(forwardRef(({ 
  videoId, 
  hasInteracted, 
  onEnded 
}: { 
  videoId: string; 
  hasInteracted: boolean;
  onEnded: () => void;
}, ref) => {
  const playerRef = useRef<any>(null);
  const playerElementId = "yt-player-main";

  const forceUnmute = useCallback((player: any) => {
    if (player) {
      if (typeof player.unMute === 'function') player.unMute();
      if (typeof player.setVolume === 'function') player.setVolume(100);
      if (typeof player.playVideo === 'function') player.playVideo();
    }
  }, []);

  // Expose synchronous method for user gesture context
  useImperativeHandle(ref, () => ({
    forcePlayWithSound: () => {
      if (playerRef.current) {
        forceUnmute(playerRef.current);
      }
    }
  }));

  useEffect(() => {
    let isMounted = true;
    let checkInterval: any;

    const initPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player || !document.getElementById(playerElementId)) return;

      if (!videoId) {
        onEnded();
        return;
      }

      playerRef.current = new window.YT.Player(playerElementId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        host: 'https://www.youtube.com',
        playerVars: {
          enablejsapi: 1,
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          mute: hasInteracted ? 0 : 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (isMounted && hasInteracted) forceUnmute(event.target);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            const p = event.target;
            
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              if (hasInteracted) forceUnmute(p);
            } else if (event.data === window.YT.PlayerState.PAUSED && isMounted) {
              p.playVideo();
            }
          },
          onError: (event: any) => {
            const errorId = event.data;
            console.error(`YouTube Error [${errorId}] for video: ${videoId}. Skipping immediately...`);
            
            // Error 150/101 = Restricted/Deceased. Skip IMMEDIATELY.
            if (isMounted) onEnded();
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.querySelector('script[src*="iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };

      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initPlayer();
          clearInterval(checkInterval);
        }
      }, 1000);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [videoId, onEnded]); // Initialize on every videoId change (Stable Lifecycle)

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div id={playerElementId} className="w-full h-full pointer-events-none" />
    </div>
  );
}));

const MainContent = () => {
  const { config } = useDisplay();
  const activeProgram = useVideoSchedule();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Separate indices for robust playlist management
  const [defaultPlaylistIndex, setDefaultPlaylistIndex] = useState(0);
  const [scheduledPlaylistIndex, setScheduledPlaylistIndex] = useState(0);

  useEffect(() => {
    const interacted = sessionStorage.getItem('display-interacted');
    if (interacted) setHasInteracted(true);
  }, []);

  const handleInteraction = () => {
    setHasInteracted(true);
    sessionStorage.setItem('display-interacted', 'true');
  };

  useEffect(() => {
    if (activeProgram.contentType === "slider" && (activeProgram.content as string[]).length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (activeProgram.content as string[]).length);
      }, (config.announcementInterval || 5) * 1000);
      return () => clearInterval(timer);
    }
  }, [activeProgram.contentType, activeProgram.content, config.announcementInterval]);

  // Reset scheduled index when a new program starts
  useEffect(() => {
    setScheduledPlaylistIndex(0);
  }, [activeProgram.content]);

  const handleVideoEnded = useCallback(() => {
    const isScheduled = !!activeProgram.content && activeProgram.contentType === "video";
    
    if (isScheduled) {
      const playlist = Array.isArray(activeProgram.content) ? activeProgram.content : [activeProgram.content as string];
      if (playlist.length > 1) {
        setScheduledPlaylistIndex(prev => (prev + 1) % playlist.length);
      }
    } else {
      const playlist = config.defaultVideoUrls && config.defaultVideoUrls.length > 0 
        ? config.defaultVideoUrls 
        : [config.videoUrl];
      
      if (playlist.length > 1) {
        setDefaultPlaylistIndex(prev => (prev + 1) % playlist.length);
      } else {
        // Force state refresh for single video loop
        setDefaultPlaylistIndex(0);
      }
    }
  }, [activeProgram.content, activeProgram.contentType, config.defaultVideoUrls, config.videoUrl]);

  // Determine current video source
  const isScheduled = !!activeProgram.content && activeProgram.contentType === "video";
  const activeContent = activeProgram.content;
  const configPlaylist = config.defaultVideoUrls && config.defaultVideoUrls.length > 0 ? config.defaultVideoUrls : [config.videoUrl];
  
  const currentPlaylist = isScheduled 
    ? (Array.isArray(activeContent) ? activeContent : [activeContent])
    : configPlaylist;

  const currentIndex = isScheduled ? scheduledPlaylistIndex : defaultPlaylistIndex;
  const rawUrl = currentPlaylist[currentIndex % currentPlaylist.length] || "";
  const videoToPlay = extractYouTubeId(rawUrl);
  const videoPlayerRef = useRef<any>(null);

  // Auto-skip invalid or empty entries in the playlist
  useEffect(() => {
    if (currentPlaylist.length > 0 && !videoToPlay) {
      console.warn(`Invalid YouTube URL detected: "${rawUrl}". Skipping to next...`);
      handleVideoEnded();
    }
  }, [videoToPlay, currentPlaylist.length, handleVideoEnded, rawUrl]);

  // Proper empty state detection
  const isContentEmpty = activeProgram.contentType === "video" 
    ? (!videoToPlay && !activeProgram.content)
    : (!activeProgram.content || (Array.isArray(activeProgram.content) && activeProgram.content.length === 0));

  return (
    <div className="w-full h-full bg-black rounded-[calc(var(--radius)-0.3vw)] overflow-hidden relative shadow-inner" onClick={() => {
      handleInteraction();
      videoPlayerRef.current?.forcePlayWithSound();
    }}>
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
          <VideoPlayer 
            key={videoToPlay}
            ref={videoPlayerRef}
            videoId={videoToPlay} 
            hasInteracted={hasInteracted} 
            onEnded={handleVideoEnded} 
          />
          
          {!hasInteracted && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-50 transition-all active:scale-95" onClick={(e) => {
              e.stopPropagation(); // Prevent double trigger if bubble
              handleInteraction();
              videoPlayerRef.current?.forcePlayWithSound();
            }}>
              <div className="bg-white/10 border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl text-center space-y-2">
                <div className="text-[2.5vw] animate-bounce">👆</div>
                <h3 className="text-white font-montserrat font-black text-[1.2vw] uppercase tracking-widest">Klik Untuk Aktifkan Video</h3>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0">
          {((activeProgram.content as string[]) || []).map((contentItem, i) => {
            // Safety check: ensure we don't try to render YouTube URLs as images in slider mode
            const isVideoUrl = contentItem?.includes("youtube.com") || contentItem?.includes("youtu.be");
            if (isVideoUrl) return null;
            
            return (
              <img
                key={i}
                src={contentItem}
                alt={`Slide ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MainContent;



