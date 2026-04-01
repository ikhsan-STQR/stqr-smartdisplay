import { useState, useEffect } from "react";
import { useDisplay } from "@/context/DisplayContext";

const DisplaySidebar = () => {
  const { config } = useDisplay();
  const [currentPoster, setCurrentPoster] = useState(0);

  useEffect(() => {
    if (config.announcementPosters.length > 1) {
      const timer = setInterval(() => {
        setCurrentPoster((prev) => (prev + 1) % config.announcementPosters.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [config.announcementPosters.length]);

  return (
    <div className="w-[32%] flex flex-col gap-1 m-2 ml-1">
      {/* Pengumuman */}
      <div className="bg-orange px-3 py-1.5 rounded-t-lg">
        <span className="text-primary-foreground font-poppins font-bold text-xs uppercase tracking-widest">
          Pengumuman
        </span>
      </div>
      <div className="relative h-[40%] bg-card rounded-b-lg overflow-hidden shadow-md border border-border">
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

      {/* Jadwal Kelas */}
      <div className="bg-orange px-3 py-1.5 rounded-t-lg mt-1">
        <span className="text-primary-foreground font-poppins font-bold text-xs uppercase tracking-widest">
          Jadwal Kelas
        </span>
      </div>
      <div className="flex-1 bg-card rounded-b-lg overflow-auto shadow-md border border-border">
        <table className="w-full text-xs">
          <tbody>
            {config.jadwalPelajaran.map((item, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? "bg-card" : "bg-muted"
                } border-b border-border`}
              >
                <td className="px-3 py-1.5 font-bold text-primary font-poppins text-center w-16">
                  {item.kelas}
                </td>
                <td className="px-3 py-1.5 font-poppins font-semibold text-foreground text-center">
                  {item.pelajaran}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplaySidebar;
