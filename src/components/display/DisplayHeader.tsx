import { useState, useEffect } from "react";
import logoStqr from "@/assets/logo-stqr.png";

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const DisplayHeader = () => {
  return (
    <header className="flex items-center gap-[1.5vw] bg-transparent font-barlow">
      {/* 1. Logo Container (Clean & Integrated) */}
      <div className="p-2 bg-white rounded-xl shadow-lg border border-black/5 flex items-center justify-center">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className="h-[5.5vh] w-[5.5vh] flex-shrink-0 object-contain"
        />
      </div>

      {/* 2. Proportional Text Titles */}
      <div className="flex flex-col">
        <h1 className="text-[#1a1a1a] font-black text-[2.8vw] tracking-tighter leading-none uppercase">
          STQ Riyadhussholihiin
        </h1>
        <p className="text-[#9e8549] font-black text-[2.2vw] leading-tight tracking-[0.1em] uppercase">
          School Digital Information Display
        </p>
      </div>
    </header>
  );
};

export default DisplayHeader;
