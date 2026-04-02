

## Plan: Perbaikan Display + Jadwal Sholat Otomatis + Transisi Sidebar

### Ringkasan

Anda akan upload gambar referensi desain untuk pencocokan presisi. Setelah itu, saya akan:

1. **Mencocokkan layout, warna, dan font** sesuai gambar referensi yang Anda upload
2. **Menambahkan jadwal sholat otomatis** dihitung di aplikasi berdasarkan nama kota
3. **Membuat sidebar 3-panel bergantian** (jadwal kelas → jadwal sholat → pengumuman) dengan transisi halus
4. **Memverifikasi tampilan di 1920x1080** fullscreen

### Menunggu dari Anda

- **Upload gambar referensi** agar saya bisa mencocokkan warna, font, dan proporsi secara presisi
- **Nama kota lokasi sekolah** (contoh: "Bekasi", "Bogor", "Jakarta Selatan") untuk perhitungan jadwal sholat

### Detail Teknis

**1. Jadwal Sholat — Hitung di Aplikasi**
- Install library `adhan` (lightweight prayer time calculator, ~15KB)
- Buat utility `src/lib/prayerTimes.ts` yang menerima koordinat dari nama kota (hardcoded mapping kota → lat/lng Indonesia)
- Hitung 5 waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya) + Sunrise menggunakan metode Kemenag RI
- Jadwal di-recalculate setiap hari otomatis

**2. Sidebar 3-Panel Bergantian**
- Rotasi otomatis: Jadwal Kelas (10s) → Jadwal Sholat (10s) → Pengumuman/Poster (10s)
- Header sidebar berubah sesuai panel aktif ("Jadwal Kelas" / "Jadwal Sholat" / "Pengumuman")
- Transisi fade-in/fade-out 500ms antar panel menggunakan CSS opacity + transition

**3. Warna & Proporsi**
- Akan disesuaikan setelah gambar referensi diterima
- Sementara: perbaiki alternating row jadwal kelas ke warna biru muda yang lebih presisi

**File yang akan diubah:**
- `package.json` — tambah dependency `adhan`
- `src/lib/prayerTimes.ts` — baru, utility hitung jadwal sholat
- `src/components/display/DisplaySidebar.tsx` — 3-panel rotation + jadwal sholat panel + transisi halus
- `src/context/DisplayContext.tsx` — tambah config lokasi kota
- `src/pages/AdminPage.tsx` — tambah setting lokasi kota di admin

### Langkah Selanjutnya

Silakan **upload gambar referensi** dan **sebutkan nama kota** sekolah, lalu saya akan langsung implementasi semuanya.

