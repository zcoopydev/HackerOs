import React from 'react';

interface HackerLogoProps {
  isFadingOut?: boolean;
}

export const HackerLogo: React.FC<HackerLogoProps> = ({ isFadingOut = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none transition-all duration-1000 transform ${
        isFadingOut
          ? 'opacity-0 scale-110 filter blur-sm pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* HTML / CSS Geometric Cyber Sigil Emblem */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        {/* Outer Rotating Hexagon/Radar Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/50 animate-[spin_10s_linear_infinite] glow-border-green" />

        {/* Counter-rotating dashed circuit ring */}
        <div className="absolute inset-3 rounded-full border-2 border-dashed border-emerald-400/60 animate-[spin_7s_linear_infinite_reverse]" />

        {/* Outer Corner Accent Markers in pure CSS */}
        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
        <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

        {/* Center Glowing Hexagonal Shield Badge */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-emerald-950/90 border-2 border-emerald-400 clip-hexagon flex flex-col items-center justify-center p-2 shadow-[0_0_40px_rgba(0,255,102,0.6)]">
          {/* Cyber Skull / Glitch Core rendered with HTML & CSS elements */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            {/* Visor / Eye Array */}
            <div className="flex items-center space-x-2.5">
              <div className="w-3.5 h-2 bg-emerald-300 shadow-[0_0_8px_#00ff66] animate-pulse" />
              <div className="w-1.5 h-1.5 bg-emerald-400" />
              <div className="w-3.5 h-2 bg-emerald-300 shadow-[0_0_8px_#00ff66] animate-pulse" />
            </div>

            {/* Central Node / Crosshair */}
            <div className="relative my-1">
              <div className="w-8 h-[2px] bg-emerald-400" />
              <div className="w-[2px] h-8 bg-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00ff66]" />
            </div>

            {/* Circuit teeth / Data bus */}
            <div className="flex space-x-1.5">
              <div className="w-1.5 h-2.5 bg-emerald-400" />
              <div className="w-1.5 h-4 bg-emerald-300" />
              <div className="w-1.5 h-2.5 bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Horizontal Laser Scanning Beams */}
        <div className="absolute w-56 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* Cyber System Brand Typography */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <h1 className="font-mono font-black text-2xl sm:text-3xl tracking-[0.3em] text-emerald-300 glow-text-green uppercase">
            NEXUS // OS
          </h1>
          <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <p className="text-xs sm:text-sm text-emerald-500 font-mono tracking-widest mt-1">
          [ CYBER-SECURITY PROTOCOL // ARCH_V9.4 // INITIALIZING ]
        </p>
      </div>
    </div>
  );
};
