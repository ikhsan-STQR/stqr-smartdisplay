import { useState } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { config, updateConfig } = useDisplay();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Conceptual auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-border max-w-sm w-full">
          <h2 className="text-xl font-poppins font-bold text-primary mb-4">Admin Login</h2>
          <p className="text-muted-foreground text-sm mb-4">Masukkan password untuk mengakses panel admin (demo: "admin")</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border border-input rounded-md mb-3 text-sm"
            onKeyDown={(e) => e.key === "Enter" && password === "admin" && setIsAuthenticated(true)}
          />
          <button
            onClick={() => password === "admin" && setIsAuthenticated(true)}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-poppins font-semibold text-sm hover:opacity-90 transition"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  const handleAddSchedule = () => {
    updateConfig({
      jadwalPelajaran: [...config.jadwalPelajaran, { kelas: "", pelajaran: "", waktu: "" }],
    });
  };

  const updateSchedule = (index: number, field: keyof ScheduleItem, value: string) => {
    const updated = [...config.jadwalPelajaran];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ jadwalPelajaran: updated });
  };

  const removeSchedule = (index: number) => {
    updateConfig({
      jadwalPelajaran: config.jadwalPelajaran.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-primary islamic-pattern px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-primary-foreground font-poppins font-bold text-lg">
            Panel Admin — STQ Riyadhussholihiin
          </h1>
          <p className="text-gold text-xs font-poppins">Kelola konten display digital</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="bg-gold text-foreground px-4 py-2 rounded-md font-poppins font-semibold text-sm hover:opacity-90 transition"
        >
          Lihat Display →
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Main Content Type */}
        <Section title="Konten Utama">
          <label className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium">Tipe Konten:</span>
            <select
              value={config.contentType}
              onChange={(e) => updateConfig({ contentType: e.target.value as "video" | "slider" })}
              className="border border-input rounded-md px-3 py-1.5 text-sm"
            >
              <option value="slider">Image Slider</option>
              <option value="video">Video Player</option>
            </select>
          </label>

          {config.contentType === "video" && (
            <InputField
              label="URL Video (YouTube Embed)"
              value={config.videoUrl}
              onChange={(v) => updateConfig({ videoUrl: v })}
            />
          )}

          {config.contentType === "slider" && (
            <ArrayField
              label="URL Gambar Slider"
              values={config.sliderImages}
              onChange={(v) => updateConfig({ sliderImages: v })}
            />
          )}
        </Section>

        {/* Announcements */}
        <Section title="Pengumuman (Poster Slider)">
          <ArrayField
            label="URL Poster"
            values={config.announcementPosters}
            onChange={(v) => updateConfig({ announcementPosters: v })}
          />
        </Section>

        {/* Schedule */}
        <Section title="Jadwal Pelajaran">
          <div className="space-y-2">
            {config.jadwalPelajaran.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={item.kelas}
                  onChange={(e) => updateSchedule(i, "kelas", e.target.value)}
                  placeholder="Kelas"
                  className="border border-input rounded px-2 py-1 text-sm w-20"
                />
                <input
                  value={item.pelajaran}
                  onChange={(e) => updateSchedule(i, "pelajaran", e.target.value)}
                  placeholder="Pelajaran"
                  className="border border-input rounded px-2 py-1 text-sm flex-1"
                />
                <input
                  value={item.waktu}
                  onChange={(e) => updateSchedule(i, "waktu", e.target.value)}
                  placeholder="Waktu"
                  className="border border-input rounded px-2 py-1 text-sm w-20"
                />
                <button onClick={() => removeSchedule(i)} className="text-destructive text-sm font-bold px-2">✕</button>
              </div>
            ))}
            <button onClick={handleAddSchedule} className="text-primary text-sm font-semibold">+ Tambah Jadwal</button>
          </div>
        </Section>

        {/* Footer Content */}
        <Section title="Konten Footer">
          <InputField
            label="Dalil Hari Ini"
            value={config.dalilHariIni}
            onChange={(v) => updateConfig({ dalilHariIni: v })}
            multiline
          />
          <InputField
            label="Running Text"
            value={config.runningText}
            onChange={(v) => updateConfig({ runningText: v })}
            multiline
          />
          <div className="mb-3">
            <label className="text-sm font-medium text-foreground block mb-1">
              Kecepatan Running Text: {config.runningTextSpeed}s (semakin kecil = semakin cepat)
            </label>
            <input
              type="range"
              min="10"
              max="120"
              value={config.runningTextSpeed}
              onChange={(e) => updateConfig({ runningTextSpeed: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Cepat (10s)</span>
              <span>Lambat (120s)</span>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
    <h2 className="font-poppins font-bold text-foreground text-base mb-4 border-b border-border pb-2">{title}</h2>
    {children}
  </div>
);

const InputField = ({
  label, value, onChange, multiline,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div className="mb-3">
    <label className="text-sm font-medium text-foreground block mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-input rounded-md px-3 py-2 text-sm min-h-[80px]"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-input rounded-md px-3 py-2 text-sm"
      />
    )}
  </div>
);

const ArrayField = ({
  label, values, onChange,
}: { label: string; values: string[]; onChange: (v: string[]) => void }) => (
  <div className="mb-3">
    <label className="text-sm font-medium text-foreground block mb-1">{label}</label>
    {values.map((v, i) => (
      <div key={i} className="flex gap-2 mb-1">
        <input
          value={v}
          onChange={(e) => {
            const updated = [...values];
            updated[i] = e.target.value;
            onChange(updated);
          }}
          className="flex-1 border border-input rounded-md px-3 py-1.5 text-sm"
        />
        <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-destructive text-sm font-bold px-2">✕</button>
      </div>
    ))}
    <button onClick={() => onChange([...values, ""])} className="text-primary text-sm font-semibold">+ Tambah</button>
  </div>
);

export default AdminPage;
