import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const DisplaySidebar = () => {
  const { config } = useDisplay();
  const [showSchedule, setShowSchedule] = useState(true);
  const [currentPoster, setCurrentPoster] = useState(0);

  useEffect(() => {
    if (config.announcementPosters.length > 0) {
      const timer = setInterval(() => {
        setShowSchedule((prev) => !prev);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [config.announcementPosters.length]);

  useEffect(() => {
    if (!showSchedule && config.announcementPosters.length > 1) {
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % config.announcementPosters.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [showSchedule, config.announcementPosters.length]);

  return (
    <div className="w-[32%] flex flex-col m-[0.5vw] ml-0">
      {/* Header - JADWAL KELAS */}
      <div className="bg-orange px-[1vw] py-[0.5vh]">
        <span className="text-primary-foreground font-barlow font-bold text-[1.6vw] uppercase tracking-wider">
          {showSchedule ? "Jadwal Kelas" : "Pengumuman"}
        </span>
      </div>

      {/* Content area */}
      <div className="flex-1 bg-card overflow-hidden relative">
        {showSchedule ? (
          <table className="w-full">
            <tbody>
              {config.jadwalPelajaran.map((item, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0
                      ? "bg-[hsl(190,80%,85%)]"
                      : "bg-card"
                  } border-b border-border`}
                >
                  <td className="px-[1vw] py-[0.3vh] font-bold text-foreground font-barlow text-[1.2vw] text-center w-[30%]">
                    {item.kelas}
                  </td>
                  <td className="px-[1vw] py-[0.3vh] font-barlow font-bold text-foreground text-[1.2vw] text-center">
                    {item.pelajaran}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="absolute inset-0">
            {config.announcementPosters.map((poster, i) => (
              <img
                key={i}
                src={poster}
                alt={`Pengumuman ${i + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === currentPoster ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplaySidebar;