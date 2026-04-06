import { useState, useCallback } from "react";
import { useDisplay, ScheduleItem } from "@/context/DisplayContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const AdminPage = () => {
  const { 
    config, updateConfig, saveToCloud, isSaving: configSaving,
    settings, updateSettings, saveSettings, isSaving: settingsSaving 
  } = useDisplay();
  const { user, isAdmin, isLoading: authLoading, userRole, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [importMode, setImportMode] = useState<'KBM' | 'RAMADHAN' | 'PAS_PAT'>('KBM');

  const handleLogin = async () => {
    setLoginError("");
    const { error } = await signIn(email, password);
    if (error) {
      setLoginError(error.message);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await saveToCloud();
      toast.success("Konfigurasi Konten berhasil disimpan!");
    } catch (e: any) {
      console.error("CRITICAL CONFIG SAVE ERROR:", e);
      toast.error(`Gagal menyimpan: ${e?.message || "Unknown Error"}`);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      toast.success("Pengaturan Mode & Catatan berhasil disimpan!");
    } catch (e: any) {
      console.error("CRITICAL SETTINGS SAVE ERROR:", e);
      toast.error(`Gagal menyimpan: ${e?.message || "Unknown Error"}`);
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
          <h2 className="text-2xl font-bold text-primary mb-2 text-center font-poppins">Admin Login</h2>
          <p className="text-muted-foreground text-sm mb-6 text-center italic">Smart Display Management</p>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@stqr.com"
                className="w-full px-4 py-2 bg-muted/20 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-muted/20 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            {loginError && <p className="text-destructive text-[10px] font-bold text-center px-4 py-1.5 bg-destructive/10 rounded-md">{loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-poppins font-bold text-sm hover:opacity-90 transition shadow-lg mt-2"
            >
              Masuk ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && userRole !== null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-jakarta">
        <div className="bg-destructive/5 p-8 rounded-2xl border border-destructive/20 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-black text-destructive font-poppins uppercase tracking-tight">Akses Ditolak</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Akun <span className="text-foreground font-bold">{user.email}</span> tidak memiliki izin administrator.
            Silahkan hubungi Superadmin untuk mendapatkan akses.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full bg-destructive text-destructive-foreground py-3 rounded-xl font-bold text-sm hover:bg-destructive/90 transition shadow-lg"
          >
            Keluar & Gunakan Akun Lain
          </button>
        </div>
      </div>
    );
  }

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTime = (val: any) => {
      if (val === undefined || val === null || val === "") return "00:00:00";
      
      // 1. Handle JS Date Objects (from XLSX cellDates: true)
      if (val instanceof Date) {
        const hh = val.getHours().toString().padStart(2, '0');
        const mm = val.getMinutes().toString().padStart(2, '0');
        return `${hh}:${mm}:00`;
      }

      // 2. Handle Numbers (Excel Serial Time or Decimal HH.mm)
      if (typeof val === 'number') {
        if (val < 1) {
          // XLSX Serial Time (fraction of a day)
          const totalSeconds = Math.round(val * 24 * 3600);
          const hh = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
          const mm = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
          return `${hh}:${mm}:00`;
        } else {
          // Decimal format (e.g., 7.45 or 7.3)
          let str = val.toFixed(2).replace('.', ':');
          const [h, m] = str.split(':');
          return `${h.padStart(2, '0')}:${m.padEnd(2, '0').substring(0, 2)}:00`;
        }
      }

      // 3. Handle Strings
      let str = String(val).trim().replace(/\./g, ':');
      const parts = str.split(':');
      if (parts.length >= 2) {
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        return `${h}:${m}:00`;
      }

      return "00:00:00";
    };

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary", cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Fuzzy Matcher for Column Names
        const findVal = (row: any, keys: string[]) => {
          const rowKeys = Object.keys(row);
          for (const k of keys) {
            const normalizedK = k.toLowerCase().replace(/\s+/g, '');
            const match = rowKeys.find(rk => rk.toLowerCase().replace(/\s+/g, '') === normalizedK);
            if (match) return row[match];
          }
          return undefined;
        };

        const cleanString = (val: any) => {
          return (val === undefined || val === null || val === "") ? "-" : String(val).trim();
        };

        const rawData: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: "" });

        if (rawData.length === 0) {
          toast.error("File Excel kosong atau tidak terbaca.");
          return;
        }

        const mapped = rawData.map((row: any) => ({
          day: cleanString(findVal(row, ["Hari", "Day"]) || "Senin"),
          rombel: cleanString(findVal(row, ["Rombel", "Kelas", "Class"]) || "-"),
          start_time: cleanTime(findVal(row, ["Jam Mulai", "Mulai", "Start Time", "Start"])),
          end_time: cleanTime(findVal(row, ["Jam Selesai", "Selesai", "End Time", "End"])),
          period: cleanString(findVal(row, ["JP Ke", "JP", "Period"]) || "-"),
          subject_name: cleanString(findVal(row, ["Nama Mapel", "Pelajaran", "Subject", "Mapel"]) || "-"),
          description: cleanString(findVal(row, ["Keterangan", "Description"]) || "-"),
          mode: importMode,
        }));

        // Delete existing for this mode first
        const { error: delError } = await (supabase as any)
          .from("timetables")
          .delete()
          .eq("mode", importMode);

        if (delError) throw delError;

        // Insert new
        const { error: insError } = await (supabase as any)
          .from("timetables")
          .insert(mapped);

        if (insError) throw insError;

        toast.success(`Berhasil mengimpor ${mapped.length} data jadwal untuk Mode ${importMode}!`);
      } catch (err: any) {
        console.error(err);
        toast.error("Gagal mengimpor: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // Reset
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
    <div className="min-h-screen bg-zinc-50 font-jakarta">
      <header className="bg-[#1a3a3a] islamic-pattern px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <img 
              src="https://static.vecteezy.com/system/resources/previews/025/115/254/non_2x/mosque-on-white-background-free-png.png" 
              className="h-8 w-auto invert" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-tight font-poppins uppercase">
              SMART <span className="text-yellow-400 font-medium ml-1">DISPLAY ADMIN</span>
            </h1>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Management System Control Panel</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:bg-white/10 transition-all border border-white/10"
          >
            ← Buka Smart Display
          </button>
          <button
            onClick={() => signOut()}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-xs transition-all"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Timetable System */}
        <div className="xl:col-span-4 space-y-8">
          <Section icon="🚀" title="Master Timetable & Global Mode" description="Kontrol mode aktif dan kelola database jadwal.">
            <div className="space-y-6">
              {/* Mode Switcher */}
              <div className="bg-zinc-100/50 p-4 rounded-xl border border-zinc-200">
                <label className="text-[10px] font-bold uppercase text-zinc-500 mb-3 block">Pilih Mode Display Aktif</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['KBM', 'RAMADHAN', 'PAS_PAT'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ active_mode: mode })}
                      className={`py-3 rounded-xl text-[10px] font-black transition-all ${
                        settings.active_mode === mode 
                          ? "bg-[#1a3a3a] text-white shadow-xl scale-[1.02]" 
                          : "bg-white border border-zinc-200 text-zinc-400 hover:border-zinc-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="w-full mt-4 bg-yellow-400 text-black py-2.5 rounded-xl font-bold text-xs hover:bg-yellow-500 transition shadow-sm disabled:opacity-50"
                >
                  {settingsSaving ? "⏳ Menyimpan..." : "💾 Aktifkan Mode & Simpan"}
                </button>
              </div>

              {/* Dynamic Excel Importer */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Database Schedule Importer</h3>
                  <div className="flex items-center gap-2">
                    <select 
                      value={importMode} 
                      onChange={(e) => setImportMode(e.target.value as any)}
                      className="text-[10px] font-bold border rounded-lg px-2 py-1 bg-zinc-50"
                    >
                      <option value="KBM">KBM</option>
                      <option value="RAMADHAN">RAMADHAN</option>
                      <option value="PAS_PAT">PAS / PAT</option>
                    </select>
                  </div>
                </div>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-2xl mb-2">📊</span>
                    <p className="mb-1 text-xs text-zinc-500 font-bold">Import ke Filter <span className="text-primary">{importMode}</span></p>
                    <p className="text-[10px] text-zinc-400">Pilih file .xlsx / .csv</p>
                  </div>
                  <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                </label>

                <div className="bg-zinc-100 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Panduan Kolom Excel:</p>
                  <ul className="text-[10px] text-zinc-400 space-y-1 font-medium">
                    <li>• <span className="text-zinc-600">Hari:</span> Senin, Selasa, dst</li>
                    <li>• <span className="text-zinc-600">Rombel:</span> I-A, IV-B, dst</li>
                    <li>• <span className="text-zinc-600">JP:</span> JP 1, Istirahat, dst</li>
                    <li>• <span className="text-zinc-600">Pelajaran:</span> Matematika, dsb</li>
                    <li>• <span className="text-zinc-600">Keterangan:</span> Jika Pelajaran "-"</li>
                    <li>• <span className="text-zinc-600">Mulai & Selesai:</span> HH:mm:ss</li>
                  </ul>
                </div>
              </div>

              {/* Transition Notes Editor */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm">Dynamic Content Notes</h3>
                <div className="space-y-4">
                  <NoteField label="Transition: Apel Pagi" value={settings.note_apel_pagi} onChange={v => updateSettings({ note_apel_pagi: v })} />
                  <NoteField label="Transition: Istirahat" value={settings.note_istirahat} onChange={v => updateSettings({ note_istirahat: v })} />
                  <NoteField label="Transition: Pulang" value={settings.note_pulang} onChange={v => updateSettings({ note_pulang: v })} />
                  <NoteField label="Transition: Apel Bersama" value={settings.note_apel_bersama} onChange={v => updateSettings({ note_apel_bersama: v })} />
                  <NoteField label="Transition: Hafalan Doa & Hadits" value={settings.note_hafalan} onChange={v => updateSettings({ note_hafalan: v })} />
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="w-full bg-[#1a3a3a] text-white py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition shadow-lg disabled:opacity-50"
                >
                  {settingsSaving ? "⏳ Syncing..." : "🔄 Update & Sync All Notes"}
                </button>
              </div>
            </div>
          </Section>
        </div>

        {/* Right Column: Identity & Content */}
        <div className="xl:col-span-8 space-y-8">
          {user?.email === 'superadmin@smartdisplay.com' && (
            <Section icon="🏢" title="IDENTITY SETTINGS" description="Custom branding, logo, and theme colors.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-100/50 p-6 rounded-[2rem] border border-zinc-200">
              <div className="space-y-4">
                <InputField label="Organization Name" value={config.organization_name} onChange={v => updateConfig({ organization_name: v })} />
                <InputField label="Header Subtitle" value={config.header_subtitle} onChange={v => updateConfig({ header_subtitle: v })} />
                
                <hr className="border-zinc-200" />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase text-[#1a3a3a] tracking-[0.2em] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                      Ultimate Color Palette
                    </label>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-full">Granular Level</span>
                  </div>

                  {/* BRAND ZONE */}
                  <div className="space-y-3 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em] mb-2 px-1">Brand Identity</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ColorInputWithSwatch label="Primary Brand" value={config.primary_color} onChange={v => updateConfig({ primary_color: v })} />
                      <ColorInputWithSwatch label="Secondary Brand" value={config.secondary_color} onChange={v => updateConfig({ secondary_color: v })} />
                      <ColorInputWithSwatch label="Global Accent Text" value={config.text_color_main} onChange={v => updateConfig({ text_color_main: v })} />
                    </div>
                  </div>

                  {/* HEADER ZONE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[9px] font-black text-[#1a3a3a] uppercase tracking-[0.1em] mb-2 px-1">Header Zone</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ColorInputWithSwatch label="Header BG" value={config.header_bg} onChange={v => updateConfig({ header_bg: v })} />
                      <ColorInputWithSwatch label="Title Color" value={config.header_title_color} onChange={v => updateConfig({ header_title_color: v })} />
                      <ColorInputWithSwatch label="Subtitle Color" value={config.header_subtitle_color} onChange={v => updateConfig({ header_subtitle_color: v })} />
                      <ColorInputWithSwatch label="Top Clock BG" value={config.top_clock_bg} onChange={v => updateConfig({ top_clock_bg: v })} />
                      <ColorInputWithSwatch label="Top Clock Text" value={config.top_clock_text} onChange={v => updateConfig({ top_clock_text: v })} />
                    </div>
                  </div>

                  {/* LEFT SIDEBAR ZONE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[9px] font-black text-[#1a3a3a] uppercase tracking-[0.1em] mb-2 px-1">Left Sidebar Zone</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <ColorInputWithSwatch label="Wrapper BG" value={config.left_wrapper_bg} onChange={v => updateConfig({ left_wrapper_bg: v })} />
                      <ColorInputWithSwatch label="Title BG" value={config.left_title_bg} onChange={v => updateConfig({ left_title_bg: v })} />
                      <ColorInputWithSwatch label="Title Text" value={config.left_title_text} onChange={v => updateConfig({ left_title_text: v })} />
                      <ColorInputWithSwatch label="Content Text" value={config.left_content_text} onChange={v => updateConfig({ left_content_text: v })} />
                      <ColorInputWithSwatch label="Countdown BG" value={config.left_countdown_bg} onChange={v => updateConfig({ left_countdown_bg: v })} />
                      <ColorInputWithSwatch label="Countdown Text" value={config.left_countdown_text} onChange={v => updateConfig({ left_countdown_text: v })} />
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR ZONE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[9px] font-black text-[#1a3a3a] uppercase tracking-[0.1em] mb-2 px-1">Right Sidebar Zone</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ColorInputWithSwatch label="Sidebar Title BG" value={config.right_title_bg} onChange={v => updateConfig({ right_title_bg: v })} />
                      <ColorInputWithSwatch label="Sidebar Title Text" value={config.right_title_text} onChange={v => updateConfig({ right_title_text: v })} />
                    </div>
                  </div>

                  {/* MARQUEE ZONE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[9px] font-black text-[#1a3a3a] uppercase tracking-[0.1em] mb-2 px-1">Marquee Zone</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ColorInputWithSwatch label="Marquee BG" value={config.running_text_bg} onChange={v => updateConfig({ running_text_bg: v })} />
                      <ColorInputWithSwatch label="Marquee Text" value={config.running_text_color} onChange={v => updateConfig({ running_text_color: v })} />
                      <ColorInputWithSwatch label="Wrapper BG" value={config.marquee_wrapper_bg} onChange={v => updateConfig({ marquee_wrapper_bg: v })} />
                    </div>
                  </div>

                  {/* FOOTER ZONE */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-[9px] font-black text-[#1a3a3a] uppercase tracking-[0.1em] mb-2 px-1">Footer & Prayer Zone</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ColorInputWithSwatch label="Footer BG" value={config.footer_bg} onChange={v => updateConfig({ footer_bg: v })} />
                      <ColorInputWithSwatch label="Footer Text Color" value={config.footer_text_color} onChange={v => updateConfig({ footer_text_color: v })} />
                      <ColorInputWithSwatch label="Prayer Box BG" value={config.prayer_box_bg} onChange={v => updateConfig({ prayer_box_bg: v })} />
                      <ColorInputWithSwatch label="Prayer Box Text" value={config.prayer_box_text} onChange={v => updateConfig({ prayer_box_text: v })} />
                      <ColorInputWithSwatch label="Prayer Highlight" value={config.prayer_highlight_text} onChange={v => updateConfig({ prayer_highlight_text: v })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1 block">Organization Logo</label>
                <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm relative group min-h-[160px] justify-center">
                  {config.organization_logo ? (
                    <img src={config.organization_logo} className="h-24 w-auto object-contain" alt="Logo Preview" />
                  ) : (
                    <div className="text-zinc-300 text-center">
                      <div className="text-3xl mb-2">🖼️</div>
                      <p className="text-[10px] font-bold uppercase">No Logo Set</p>
                    </div>
                  )}
                  
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:opacity-90 transition-all shadow-md mt-2">
                    {configSaving ? "UPLOADING..." : "Change Logo"}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `logo_${Math.random().toString(36).substring(7)}.${fileExt}`;
                          
                          const { data, error: uploadError } = await supabase.storage
                            .from('posters')
                            .upload(fileName, file, { upsert: true });

                          if (uploadError) {
                            console.error("Storage upload error:", uploadError);
                            if (uploadError.message.includes("not found")) {
                              throw new Error("Folder 'posters' tidak ditemukan di Supabase Storage. Silakan buat bucket bernama 'posters'.");
                            }
                            throw uploadError;
                          }

                          const { data: { publicUrl } } = supabase.storage.from('posters').getPublicUrl(fileName);
                          updateConfig({ organization_logo: publicUrl });
                          toast.success("Logo berhasil diperbarui!");
                        } catch (err: any) {
                          console.error("Critical Upload Error:", err);
                          toast.error(err.message || "Gagal mengunggah logo.");
                        }
                      }} 
                    />
                  </label>
                  {config.organization_logo && (
                    <button 
                      onClick={() => updateConfig({ organization_logo: "" })}
                      className="text-red-400 text-[9px] font-bold hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
               <button
                  onClick={handleSaveConfig}
                  disabled={configSaving}
                  className="w-full bg-[#1a3a3a] text-white py-3 rounded-2xl font-black text-xs hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {configSaving ? "⌛ SYNCING IDENTITY..." : "💾 SAVE IDENTITY & SYNC COLORS"}
                </button>
            </div>
          </Section>
          )}

          <Section icon="🎬" title="Penjadwalan Konten Utama" description="Overlay konten otomatis (Video/Poster/Running Text) pada jam tertentu.">
            <div className="space-y-4">
              {config.schedules.map((s) => (
                <div key={s.id} className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm space-y-5 relative group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Nama Activity</label>
                        <input
                          value={s.name}
                          onChange={(e) => updateContentSchedule(s.id, { name: e.target.value })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Category</label>
                        <select
                          value={s.type}
                          onChange={(e) => updateContentSchedule(s.id, { type: e.target.value as any })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm bg-zinc-50 font-bold"
                        >
                          <option value="main">Utama (Video/Slider)</option>
                          <option value="announcement">Poster Pengumuman</option>
                          <option value="runningText">Running Text</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Mulai</label>
                        <input
                          type="time"
                          value={s.startTime}
                          onChange={(e) => updateContentSchedule(s.id, { startTime: e.target.value })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Selesai</label>
                        <input
                          type="time"
                          value={s.endTime}
                          onChange={(e) => updateContentSchedule(s.id, { endTime: e.target.value })}
                          className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <button
                        onClick={() => updateContentSchedule(s.id, { isActive: !s.isActive })}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                          s.isActive ? "bg-green-500 text-white" : "bg-neutral-200 text-neutral-500"
                        }`}
                      >
                        {s.isActive ? "Live" : "Off"}
                      </button>
                      <button 
                        onClick={() => removeContentSchedule(s.id)} 
                        className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition-colors font-bold"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    {s.type === "runningText" ? (
                      <InputField
                        label="Override Running Text"
                        value={s.content as string}
                        onChange={(v) => updateContentSchedule(s.id, { content: v })}
                        multiline
                      />
                    ) : (
                      <div className="space-y-3">
                        {s.type === "main" && (
                          <div className="flex gap-2">
                            {(['slider', 'video'] as const).map(m => (
                              <button
                                key={m}
                                onClick={() => updateContentSchedule(s.id, { contentType: m })}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold capitalize transition-all ${
                                  s.contentType === m ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"
                                }`}
                              >
                                {m} Mode
                              </button>
                            ))}
                          </div>
                        )}
                        <ArrayField
                          label={s.contentType === "video" ? "Video Sources (Embed URLs)" : "Resource Links (Images/Files)"}
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
                className="w-full border-2 border-dashed border-zinc-300 text-zinc-400 py-4 rounded-2xl font-black text-xs hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">+</span> 
                ADD NEW SCHEDULED ACTIVITY
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-200">
              <button
                onClick={handleSaveConfig}
                disabled={configSaving}
                className="w-full bg-[#1a3a3a] text-white py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {configSaving ? "⌛ SAVING TO CLOUD..." : "💾 COMMIT ALL CHANGES TO SERVER"}
              </button>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Section icon="🖼️" title="Default Visuals" description="Asset permanen saat tidak ada jadwal aktif.">
              <div className="space-y-6">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-4">
                   <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black uppercase text-zinc-400">Media Mode</label>
                     <div className="flex p-1 bg-white rounded-xl border border-zinc-200">
                        {(['slider', 'video'] as const).map(m => (
                          <button
                            key={m}
                            onClick={() => updateConfig({ contentType: m })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${config.contentType === m ? "bg-primary text-white" : "text-zinc-400"}`}
                          >
                            {m}
                          </button>
                        ))}
                     </div>
                   </div>
                   {config.contentType === "video" ? (
                    <InputField label="Default Video Link" value={config.videoUrl} onChange={v => updateConfig({ videoUrl: formatYoutubeUrl(v) })} />
                   ) : (
                    <ArrayField label="Slider Collection" values={config.sliderImages} onChange={v => updateConfig({ sliderImages: v })} />
                   )}
                </div>
                <ArrayField label="Right Sidebar Posters" values={config.announcementPosters} onChange={v => updateConfig({ announcementPosters: v })} />
                
                <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-tight">
                    Transisi Poster (Detik)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="3"
                      max="30"
                      value={config.announcementInterval || 5}
                      onChange={(e) => updateConfig({ announcementInterval: parseInt(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <div className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-lg font-black text-primary">
                      {config.announcementInterval || 5}s
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2 italic">* Kecepatan pindah antar poster di sidebar kanan.</p>
                </div>
              </div>
            </Section>

            <Section icon="📢" title="Default Messaging" description="Teks berjalan dan dalil harian default.">
              <div className="space-y-5">
                <InputField label="Header Organization Subtitle" value={config.headerTitle} onChange={v => updateConfig({ headerTitle: v })} />
                <InputField label="Dalil Hari Ini" value={config.dalilHariIni} onChange={v => updateConfig({ dalilHariIni: v })} multiline />
                <InputField label="Main Running Text" value={config.runningText} onChange={v => updateConfig({ runningText: v })} multiline />
                <div className="bg-zinc-100/50 p-4 rounded-xl border border-zinc-200">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-3">Running Speed: {config.runningTextSpeed}s</label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={config.runningTextSpeed}
                    onChange={(e) => updateConfig({ runningTextSpeed: Number(e.target.value) })}
                    className="w-full accent-[#1a3a3a]"
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
};

const Section = ({ icon, title, description, children }: { icon: string; title: string; description?: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-sm">
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h2 className="font-black text-zinc-900 text-xl tracking-tight font-poppins">{title}</h2>
      </div>
      {description && <p className="text-zinc-400 text-xs font-medium leading-relaxed">{description}</p>}
    </div>
    {children}
  </div>
);

const NoteField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-xs min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
      placeholder="Ketik catatan di sini..."
    />
  </div>
);

const InputField = ({
  label, value, onChange, multiline,
}: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div className="mb-3 space-y-1">
    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm min-h-[80px] font-medium focus:ring-2 focus:ring-primary/10 outline-none"
      />
    ) : (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none"
      />
    )}
  </div>
);

const ColorInputWithSwatch = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1 block">{label}</label>
    <div className="flex gap-2 items-center bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/60 transition-all hover:bg-white group">
      <div className="relative w-8 h-8 shrink-0">
        <input 
          type="color" 
          value={value || "#000000"} 
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="w-full h-full rounded-lg border border-zinc-200 shadow-sm"
          style={{ backgroundColor: value || "#000000" }}
        />
      </div>
      <input 
        type="text" 
        value={value || "#000000"} 
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent px-2 py-1 text-xs font-mono uppercase focus:outline-none transition-all font-bold text-zinc-600 tracking-wider"
        placeholder="#000000"
      />
    </div>
  </div>
);

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">{label}</label>
    <div className="flex gap-2">
      <input 
        type="color" 
        value={value || "#000000"} 
        onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
      />
      <input 
        type="text" 
        value={value || "#000000"} 
        onChange={e => onChange(e.target.value)}
        className="flex-1 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
      />
    </div>
  </div>
);

const formatYoutubeUrl = (url: string) => {
  if (!url) return "";
  const embedMatch = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&?/\s]+)/);
  if (embedMatch) {
    const videoId = embedMatch[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&enablejsapi=1`;
  }
  return url;
};

const ArrayField = ({
  label, values, onChange,
}: { label: string; values: string[]; onChange: (v: string[]) => void }) => {
  const [uploading, setUploading] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(index);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Poster Storage Error:", uploadError);
        if (uploadError.message.includes("not found")) {
          throw new Error("Folder 'posters' tidak ditemukan di Supabase Storage. Silakan buat bucket bernama 'posters'.");
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('posters').getPublicUrl(filePath);

      const updated = [...values];
      updated[index] = publicUrl;
      onChange(updated);
      toast.success("Poster berhasil diunggah!");
    } catch (err: any) {
      console.error("Critical Poster Upload Error:", err);
      toast.error(err.message || "Gagal mengunggah poster.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="mb-3 space-y-2">
      <label className="text-[10px] font-black text-zinc-400 block uppercase tracking-wider ml-1">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2 items-center bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/60 group">
            <input
              value={v.startsWith("data:image") ? "[Image Data]" : v}
              onChange={(e) => {
                const updated = [...values];
                updated[i] = e.target.value;
                onChange(updated);
              }}
              placeholder="https://resource-url.com/..."
              className="flex-1 bg-transparent px-3 py-1 text-xs focus:ring-0 outline-none font-medium text-zinc-600"
            />
            <div className="flex gap-1 items-center">
              <label className="cursor-pointer hover:bg-white p-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-200" title="Upload Media">
                <span className="text-[9px] font-black text-primary uppercase">
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
                className="text-red-400 hover:bg-white p-1.5 rounded-lg transition-all border border-transparent hover:border-red-100"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => onChange([...values, ""])}
          className="text-primary text-[10px] font-black hover:bg-primary/5 px-3 py-2 rounded-xl border border-primary/20 transition-all flex items-center gap-2 mt-2"
        >
          <span>+</span> TAMBAH RESOURCE BARU
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
