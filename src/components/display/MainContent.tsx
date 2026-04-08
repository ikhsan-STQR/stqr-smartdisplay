import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useDisplay } from "@/context/DisplayContext";
import { useVideoSchedule } from "@/hooks/useVideoSchedule";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

// Dedicated VideoPlayer component to isolate from clock re-renders
const VideoPlayer = memo(({ 
  videoId, 
  hasInteracted, 
  onEnded 
}: { 
  videoId: string; 
  hasInteracted: boolean;
  onEnded: () => void;
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerElementId = "yt-player-main"; // Use stable ID

  // Handle video loading/changing
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  // Handle mute/unmute
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.mute === 'function') {
      if (hasInteracted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
  }, [hasInteracted]);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player || !document.getElementById(playerElementId)) {
        return;
      }

      const currentOrigin = window.location.origin;

      playerRef.current = new window.YT.Player(playerElementId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          enablejsapi: 1,
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          mute: hasInteracted ? 0 : 1,
          origin: currentOrigin,
          widget_referrer: currentOrigin,
        },
        events: {
          onReady: (event: any) => {
            if (isMounted) {
              if (hasInteracted) {
                event.target.unMute();
              } else {
                event.target.mute();
              }
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnded();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // Auto-resume if paused (e.g. by API glitch)
              event.target.playVideo();
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            setTimeout(() => {
              if (isMounted) onEnded();
            }, 3000);
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      const timer = setTimeout(initPlayer, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch (e) {}
          playerRef.current = null;
        }
      };
    } else {
      if (!document.querySelector('script[src*="iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          initPlayer();
          clearInterval(interval);
        }
      }, 1000);
      
      return () => {
        isMounted = false;
        clearInterval(interval);
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch (e) {}
          playerRef.current = null;
        }
      };
    }
  }, [onEnded]); // Only initialize once

  return (
    <div ref={containerRef} className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <div id={playerElementId} className="w-full h-full pointer-events-none" />
    </div>
  );
});

const MainContent = () => {
  const { config } = useDisplay();
  const activeProgram = useVideoSchedule();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);

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

  // Reset playlist index when content changes to ensure we start from the beginning
  useEffect(() => {
    setCurrentPlaylistIndex(0);
  }, [activeProgram.content, activeProgram.contentType]);

  const handleVideoEnded = useCallback(() => {
    const activeContent = activeProgram.content;
    const playlist = Array.isArray(activeContent) 
      ? activeContent 
      : (activeContent ? [activeContent as string] : config.defaultVideoUrls || []);

    if (playlist.length > 1) {
      setCurrentPlaylistIndex((prev) => (prev + 1) % playlist.length);
    } else {
      // For single video, force a re-play if possible, or trigger a refresh of videoToPlay
      setCurrentPlaylistIndex(0);
      // Small state toggle to force VideoPlayer remount if it's the same video
      // But since we use videoToPlay as key, if it's same video, it won't remount.
      // The VideoPlayer onStateChange now handles re-playing if the ID hasn't changed.
    }
  }, [activeProgram.content, config.defaultVideoUrls]);

  const getYouTubeId = (url: any) => {
    if (!url || typeof url !== 'string') return "";
    const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/)|youtu\.be\/)([^&?/\s]+)/);
    if (match) return match[1];
    const playlistMatch = url.match(/[?&]playlist=([^&?/\s]+)/);
    if (playlistMatch) return playlistMatch[1];
    const trimmed = url.trim();
    return trimmed.length === 11 ? trimmed : "";
  };

  let videoToPlay = "";
  const configPlaylist = config.defaultVideoUrls && config.defaultVideoUrls.length > 0 ? config.defaultVideoUrls : [config.videoUrl];
  const activeContent = activeProgram.content;
  const currentPlaylist = Array.isArray(activeContent) ? activeContent : (activeContent ? [activeContent] : configPlaylist);

  if (currentPlaylist.length > 0) {
    const safeIndex = currentPlaylistIndex % currentPlaylist.length;
    videoToPlay = getYouTubeId(currentPlaylist[safeIndex]);
  }

  // Proper empty state detection
  const isContentEmpty = activeProgram.contentType === "video" 
    ? (!videoToPlay && !activeProgram.content)
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
          <VideoPlayer 
            videoId={videoToPlay} 
            hasInteracted={hasInteracted} 
            onEnded={handleVideoEnded} 
          />
          
          {!hasInteracted && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-50 transition-all active:scale-95" onClick={handleInteraction}>
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



