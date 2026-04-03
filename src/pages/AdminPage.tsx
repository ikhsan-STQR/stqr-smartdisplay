import { useState } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const AdminPage = () => {
  const { config, updateConfig, saveToCloud, isSaving } = useDisplay();
  const { user, isAdmin, isLoading: authLoading, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    const { error } = await signIn(email, password);
    if (error) {
      setLoginError(error.message);
    }
  };

  const handleSave = async () => {
    try {
      await saveToCloud();
      toast.success("Konfigurasi berhasil disimpan ke Cloud!");
    } catch (e: any) {
      toast.error("Gagal menyimpan: " + e.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-jakarta">
        <div className="bg-card p-8 rounded-xl shadow-xl border border-border max-w-sm w-full">
          <h2 className="text-2xl font-bold text-primary mb-2 text-center">Admin Login</h2>
          <p className="text-muted-foreground text-sm mb-6 text-center italic">STQ Riyadhussholihiin Display Management</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stqr.com"
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
            {loginError && <p className="text-destructive text-xs text-center">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-poppins font-semibold text-sm hover:opacity-90 transition shadow-md mt-2"
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
      jadwalPelajaran: [...config.jadwalPelajaran, { kelas: "", pelajaran: "", startTime: "07:30", endTime: "08:30" }],
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

  const handleAddTimeBlock = () => {
    updateConfig({
      timetable: [
        ...config.timetable,
        { id: Math.random().toString(36).substr(2, 9), name: "", startTime: "07:30", endTime: "08:10", mode: 'KBM', dayOfWeek: 1, type: 'class' },
      ],
    });
  };

  const updateTimeBlock = (index: number, field: string, value: any) => {
    const updated = [...config.timetable];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ timetable: updated });
  };

  const removeTimeBlock = (index: number) => {
    updateConfig({
      timetable: config.timetable.filter((_, i) => i !== index),
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const mapped = data.map((row: any) => {
          const hariRaw = String(row.Hari || row.hari || "1").toLowerCase();
          let dayNum = parseInt(hariRaw);
          if (isNaN(dayNum)) {
            const map: any = { senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6, minggu: 0, ahad: 0 };
            dayNum = map[hariRaw] ?? 1;
          }

          return {
            id: Math.random().toString(36).substr(2, 9),
            mode: (row.Mode || row.mode || "KBM").toUpperCase(),
            dayOfWeek: dayNum,
            name: row.Kegiatan || row.kegiatan || "Tanpa Nama",
            startTime: row.Mulai || row.mulai || "07:00",
            endTime: row.Selesai || row.selesai || "08:00",
            type: (row.Tipe || row.tipe || "class").toLowerCase(),
          };
        });

        updateConfig({ masterTimetable: mapped as any });
        toast.success(`Berhasil mengimpor ${mapped.length} data jadwal!`);
      } catch (err) {
        toast.error("Gagal membaca file Excel. Pastikan format kolom sesuai.");
      }
    };
    reader.readAsBinaryString(file);
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
    <div className="min-h-screen bg-background font-jakarta">
      <header className="bg-primary islamic-pattern px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div>
          <h1 className="text-primary-foreground font-bold text-lg">
            Panel Admin — STQ Riyadhussholihiin
          </h1>
          <p className="text-gold/80 text-[10px] font-medium uppercase tracking-wider">Display Management System</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition shadow-md disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "💾 Simpan ke Cloud"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition"
          >
            Lihat Display
          </button>
          <button
            onClick={() => signOut()}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-8 pb-12">
        {/* Scheduling Section */}
        <Section title="📅 Penjadwalan Konten" description="Atur konten yang muncul otomatis berdasarkan waktu dan hari.">
          <div className="space-y-4">
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
                        onChange={(v) => {
                          const formatted = s.contentType === "video" ? v.map(formatYoutubeUrl) : v;
                          updateContentSchedule(s.id, { content: formatted });
                        }}
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
                    onChange={(v) => updateConfig({ videoUrl: formatYoutubeUrl(v) })}
                  />
                ) : (
                  <ArrayField
                    label="URL Gambar Slider Default"
                    values={config.sliderImages}
                    onChange={(v) => updateConfig({ sliderImages: v })}
                  />
                )}
                <div className="pt-2">
                  <InputField
                    label="Judul Header Utama"
                    value={config.headerTitle}
                    onChange={(v) => updateConfig({ headerTitle: v })}
                  />
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-xl space-y-4">
                <h3 className="font-bold text-sm border-b pb-2">Default Pengumuman</h3>
                <ArrayField
                  label="URL Poster Default"
                  values={config.announcementPosters}
                  onChange={(v) => updateConfig({ announcementPosters: v })}
                />
                <div className="pt-2">
                  <label className="text-xs font-bold text-muted-foreground block mb-1 uppercase">
                    Durasi Slide Pengumuman: {config.announcementInterval}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={config.announcementInterval}
                    onChange={(e) => updateConfig({ announcementInterval: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
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
                <InputField
                  label="Lokasi Jadwal Shalat (Kecamatan/Kota)"
                  value={config.prayerLocation}
                  onChange={(v) => updateConfig({ prayerLocation: v })}
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
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                          className="border border-input rounded px-1 py-1 text-[10px] w-16"
                        />
                        <span className="text-muted-foreground text-[10px]">-</span>
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(e) => updateSchedule(i, "endTime", e.target.value)}
                          className="border border-input rounded px-1 py-1 text-[10px] w-16"
                        />
                      </div>
                      <button onClick={() => removeSchedule(i)} className="text-destructive font-bold px-1">✕</button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="w-full py-1.5 border border-primary/50 text-primary text-xs rounded-lg font-bold hover:bg-primary/5 mb-4"
                >
                  + Tambah Baris Jadwal
                </button>

                <h3 className="font-bold text-sm border-b pb-2 pt-4">Advanced Master Timetable</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-lg border border-border/50">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground block">Mode Jadwal Aktif</label>
                      <div className="flex gap-2 mt-1">
                        {['KBM', 'RAMADHAN', 'PAS_PAT'].map(m => (
                          <button
                            key={m}
                            onClick={() => updateConfig({ activeScheduleMode: m as any })}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                              config.activeScheduleMode === m 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "bg-white border border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-colors">
                      📁 Import Excel
                      <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcelImport} />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t pt-4">
                    <InputField 
                      label="Text Saat Tidak Ada Kegiatan" 
                      value={config.customTexts.noActivityText} 
                      onChange={(v) => updateConfig({ customTexts: { ...config.customTexts, noActivityText: v } })} 
                    />
                    <InputField 
                      label="Judul Saat Istirahat" 
                      value={config.customTexts.breakTitle} 
                      onChange={(v) => updateConfig({ customTexts: { ...config.customTexts, breakTitle: v } })} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground block">Catatan Istirahat</label>
                        <textarea
                          value={config.customTexts.breakNotes}
                          onChange={(e) => updateConfig({ customTexts: { ...config.customTexts, breakNotes: e.target.value } })}
                          className="w-full border border-input rounded-md px-3 py-2 text-xs min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground block">Catatan Apel Bersama</label>
                        <textarea
                          value={config.customTexts.apelBersamaNotes}
                          onChange={(e) => updateConfig({ customTexts: { ...config.customTexts, apelBersamaNotes: e.target.value } })}
                          className="w-full border border-input rounded-md px-3 py-2 text-xs min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground block">Catatan Apel Pagi</label>
                        <textarea
                          value={config.customTexts.apelPagiNotes}
                          onChange={(e) => updateConfig({ customTexts: { ...config.customTexts, apelPagiNotes: e.target.value } })}
                          className="w-full border border-input rounded-md px-3 py-2 text-xs min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground block">Catatan Pulang</label>
                        <textarea
                          value={config.customTexts.pulangNotes}
                          onChange={(e) => updateConfig({ customTexts: { ...config.customTexts, pulangNotes: e.target.value } })}
                          className="w-full border border-input rounded-md px-3 py-2 text-xs min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground italic bg-muted/30 p-2 rounded">
                    <strong>Format Excel:</strong> Mode, Hari (0-6), Kegiatan, Mulai (HH:mm), Selesai (HH:mm), Tipe (class/break/end)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="font-bold text-foreground text-xl tracking-tight">{title}</h2>
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

const formatYoutubeUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const watchMatch = url.match(/v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${shortMatch[1]}`;
  return url;
};

const ArrayField = ({
  label, values, onChange,
}: { label: string; values: string[]; onChange: (v: string[]) => void }) => {
  const [uploading, setUploading] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar! Maksimal 5MB.");
      return;
    }

    setUploading(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);

      const updated = [...values];
      updated[index] = publicUrl;
      onChange(updated);
      toast.success("Gambar berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="mb-3">
      <label className="text-[11px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2 items-center bg-muted/10 p-1.5 rounded-lg border border-border/40">
            <input
              value={v.startsWith("data:image") ? "[Image Data Uploaded]" : v}
              onChange={(e) => {
                const updated = [...values];
                updated[i] = e.target.value;
                onChange(updated);
              }}
              placeholder="https://..."
              className="flex-1 border-none bg-transparent px-2 py-0.5 text-sm focus:ring-0"
            />
            <div className="flex gap-1 items-center">
              <label className="cursor-pointer hover:bg-primary/10 p-1.5 rounded transition-colors" title="Upload Gambar">
                <span className="text-xs font-bold text-primary">
                  {uploading === i ? "..." : "Upload"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(e) => handleFileUpload(e, i)}
                />
              </label>
              <button 
                onClick={() => onChange(values.filter((_, j) => j !== i))} 
                className="text-destructive hover:bg-destructive/10 p-1.5 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...values, ""])}
          className="text-primary text-xs font-bold hover:underline flex items-center gap-1 mt-1 ml-1"
        >
          + Tambah Link/Baris Baru
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
