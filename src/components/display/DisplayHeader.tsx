import logoStqr from "@/assets/logo-stqr.png";

const DisplayHeader = () => {
  return (
    <header className="w-full h-full flex items-center bg-transparent drop-shadow-sm">
      {/* Logo & Title */}
      <div className="flex items-center gap-[1vw]">
        <img
          src={logoStqr}
          alt="Logo STQ Riyadhussholihiin"
          className="h-[10vh] w-[10vh] flex-shrink-0 object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-[var(--display-brown)] font-barlow font-bold text-[2.2vw] tracking-normal leading-[1.1]">
            STQ Riyadhussholihiin
          </h1>
          <p className="text-[var(--display-olive)] font-barlow font-black text-[3.8vw] leading-[0.9] tracking-normal uppercase">
            School Digital Information Display
          </p>
        </div>
      </div>
    </header>
  );
};

export default DisplayHeader;
