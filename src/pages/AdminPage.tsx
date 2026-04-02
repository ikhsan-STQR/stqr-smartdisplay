import { useState } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const { config, updateConfig } = useDisplay();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "adminmedia" && password === "admin@123") {
      setIsAuthenticated(true);
    } else {
      alert("Username atau Password salah!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card p-8 rounded-xl shadow-xl border border-border max-w-sm w-full">
          <h2 className="text-2xl font-jakarta font-bold text-primary mb-2 text-center">Admin Login</h2>
          <p className="text-muted-foreground text-sm mb-6 text-center italic">STQ Riyadhussholihiin Display Management</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1 ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2 border border-input rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-input rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-jakarta font-semibold text-sm hover:opacity-90 transition shadow-md mt-2"
            >
              Masuk
            </button>
          </div>
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

  const handleAddContentSchedule = () => {
    updateConfig({
      schedules: [
        ...config.schedules,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "Jadwal Baru",
          type: "main",
          contentType: "slider",
          content: [],
          startTime: "00:00",
          endTime: "23:59",
          days: [0, 1, 2, 3, 4, 5, 6],
          isActive: true,
        },
      ],
    });
  };

  const updateContentSchedule = (id: string, updates: Partial<any>) => {
    updateConfig({
      schedules: config.schedules.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const removeContentSchedule = (id: string) => {
    updateConfig({
      schedules: config.schedules.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background font-jakarta overflow-hidden">
      {/* Admin Header */}
      <header className="bg-primary islamic-pattern px-6 py-4 flex items-center justify-between shadow-lg z-10">
        <div>
          <h1 className="text-primary-foreground font-bold text-xl tracking-tight">
            Panel Admin — STQ Riyadhussholihiin
          </h1>
          <p className="text-gold/80 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-0.5">Display Management System</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all active:scale-95 shadow-sm"
          >
            Lihat Display
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Scrollable Content Container */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-muted/10">
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10 pb-20">
          {/* Scheduling Section */}
          <Section title="📅 Penjadwalan Konten" description="Atur konten yang muncul otomatis berdasarkan waktu dan hari.">
            <div className="space-y-6">
            {config.schedules.map((s) => (
              <div key={s.id} className="bg-muted/30 border border-border p-4 rounded-xl space-y-4 relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Nama Jadwal</label>
                      <input
                        value={s.name}
                        onChange={(e) => updateContentSchedule(s.id, { name: e.target.value })}
                        className="w-full border border-input rounded-md px-2 py-1 text-sm shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Tipe</label>
                      <select
                        value={s.type}
                        onChange={(e) => updateContentSchedule(s.id, { type: e.target.value as any })}
                        className="w-full border border-input rounded-md px-2 py-1 text-sm shadow-sm"
                      >
                        <option value="main">Konten Utama (Video/Slide)</option>
                        <option value="announcement">Pengumuman (Poster)</option>
                        <option value="runningText">Running Text</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Mulai</label>
                      <input
                        type="time"
                        value={s.startTime}
                        onChange={(e) => updateContentSchedule(s.id, { startTime: e.target.value })}
                        className="w-full border border-input rounded-md px-2 py-1 text-sm shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Selesai</label>
                      <input
                        type="time"
                        value={s.endTime}
                        onChange={(e) => updateContentSchedule(s.id, { endTime: e.target.value })}
                        className="w-full border border-input rounded-md px-2 py-1 text-sm shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <button
                      onClick={() => updateContentSchedule(s.id, { isActive: !s.isActive })}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                        s.isActive ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.isActive ? "Aktif" : "Non-Aktif"}
                    </button>
                    <button onClick={() => removeContentSchedule(s.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">✕</button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  {s.type === "runningText" ? (
                    <InputField
                      label="Isi Text Schedule"
                      value={s.content as string}
                      onChange={(v) => updateContentSchedule(s.id, { content: v })}
                      multiline
                    />
                  ) : (
                    <div className="space-y-3">
                      {s.type === "main" && (
                        <select
                          value={s.contentType}
                          onChange={(e) => updateContentSchedule(s.id, { contentType: e.target.value as any })}
                          className="border border-input rounded-md px-3 py-1 text-xs mb-2"
                        >
                          <option value="slider">Mode Slider</option>
                          <option value="video">Mode Video</option>
                        </select>
                      )}
                      <ArrayField
                        label={s.contentType === "video" ? "URL Video Schedule" : "URL Gambar Schedule"}
                        values={Array.isArray(s.content) ? s.content : [s.content as string]}
                        onChange={(v) => updateContentSchedule(s.id, { content: v })}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              onClick={handleAddContentSchedule}
              className="w-full border-2 border-dashed border-primary/30 text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition flex items-center justify-center gap-2"
            >
              + Tambah Jadwal Konten Baru
            </button>
          </div>
        </Section>

        {/* Global Config Section */}
        <Section title="⚙️ Pengaturan Default" description="Konten ini akan muncul jika tidak ada jadwal yang aktif.">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm">Default Konten Utama</h3>
                  <select
                    value={config.contentType}
                    onChange={(e) => updateConfig({ contentType: e.target.value as any })}
                    className="border border-input rounded px-2 py-1 text-xs"
                  >
                    <option value="slider">Slider</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                {config.contentType === "video" ? (
                  <InputField
                    label="URL Video Default"
                    value={config.videoUrl}
                    onChange={(v) => updateConfig({ videoUrl: v })}
                  />
                ) : (
                  <ArrayField
                    label="URL Gambar Slider Default"
                    values={config.sliderImages}
                    onChange={(v) => updateConfig({ sliderImages: v })}
                  />
                )}
              </div>

              <div className="bg-muted/20 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm border-b pb-2">Default Pengumuman</h3>
                <ArrayField
                  label="URL Poster Default"
                  values={config.announcementPosters}
                  onChange={(v) => updateConfig({ announcementPosters: v })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm border-b pb-2">Default Footer</h3>
                <InputField
                  label="Dalil Hari Ini"
                  value={config.dalilHariIni}
                  onChange={(v) => updateConfig({ dalilHariIni: v })}
                  multiline
                />
                <InputField
                  label="Running Text Default"
                  value={config.runningText}
                  onChange={(v) => updateConfig({ runningText: v })}
                  multiline
                />
                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase">
                    Kecepatan: {config.runningTextSpeed}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={config.runningTextSpeed}
                    onChange={(e) => updateConfig({ runningTextSpeed: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm border-b pb-2">Jadwal Pelajaran</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {config.jadwalPelajaran.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={item.kelas}
                        onChange={(e) => updateSchedule(i, "kelas", e.target.value)}
                        placeholder="Kls"
                        className="border border-input rounded px-2 py-1 text-xs w-14"
                      />
                      <input
                        value={item.pelajaran}
                        onChange={(e) => updateSchedule(i, "pelajaran", e.target.value)}
                        placeholder="Pelajaran"
                        className="border border-input rounded px-2 py-1 text-xs flex-1"
                      />
                      <input
                        value={item.waktu}
                        onChange={(e) => updateSchedule(i, "waktu", e.target.value)}
                        placeholder="Jam"
                        className="border border-input rounded px-2 py-1 text-xs w-14"
                      />
                      <button onClick={() => removeSchedule(i)} className="text-destructive font-bold px-1">✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="w-full py-1.5 border border-primary/50 text-primary text-xs rounded-lg font-bold hover:bg-primary/5"
                >
                  + Tambah Baris Jadwal
                </button>
              </div>
            </div>
          </div>
        </Section>
      </div>
      </main>
    </div>
  );
};

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="font-poppins font-bold text-foreground text-xl tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
    </div>
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
