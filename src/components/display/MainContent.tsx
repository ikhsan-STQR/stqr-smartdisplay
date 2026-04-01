import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const MainContent = () => {
  const { config } = useDisplay();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (config.contentType === "slider" && config.sliderImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % config.sliderImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [config.contentType, config.sliderImages.length]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden m-[0.5vw] mr-[0.5vw]">
      <div className="flex-1 relative bg-foreground/5 overflow-hidden">
        {config.contentType === "video" ? (
          <iframe
            src={config.videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Video Kajian"
          />
        ) : (
          <div className="absolute inset-0">
            {config.sliderImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Slide ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {config.sliderImages.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSlide ? "bg-gold scale-125" : "bg-primary-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;