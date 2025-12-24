import React, { useEffect, useState } from "react";

// Full-screen loader overlay
// Props:
// - show: boolean → whether to render the loader
// - message: string → main message
// - subtext: string → secondary message
// - tip: string → optional small tip text
export default function Loader({
  show = true,
  message = "Loading",
  subtext = "Preparing something tasty...",
  tip = "Pro tip: You can top up your wallet anytime.",
}) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length === 3 ? "." : d + "."));
    }, 450);
    return () => clearInterval(id);
  }, []);

  // Render only when show is true
  if (!show) return null;

  return (
    <div
      className="fixed inset-0  px-4 z-[1000] flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Ambient orbs */}
      <div className="absolute -top-24 -left-20 w-64 h-64 rounded-full bg-red-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 w-64 h-64 rounded-full bg-orange-200/40 blur-3xl" />

      {/* Loader card */}
      <div className="relative w-full max-w-sm mx-auto p-6 sm:p-7 rounded-3xl shadow-2xl border border-white/60 glass bg-white/70">
        {/* Brand avatar refined */}
        <div
          className="relative mx-auto px-3 py-2 w-fit  rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-orange-500 shadow-lg ring-2 ring-white/60 overflow-hidden group"
          aria-label="MealSection loading"
        >
          <img
            src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
            alt="MealSection logo"
            className="w-30 rounded-[8px]  object-contain scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -inset-1 rounded-3xl animate-pulseSlow bg-gradient-to-r from-red-500/30 to-orange-400/30 pointer-events-none" />
        </div>

        {/* Spinner + text */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-transparent border-t-[var(--default)] border-l-[var(--default)] animate-spin" />
            <div
              className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-b-orange-400/60 border-r-orange-400/60 animate-spin"
              style={{ animationDuration: "1400ms" }}
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {message}
            <span className="inline-block w-5 text-left">{dots}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">{subtext}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 animate-[progress_1.4s_ease-in-out_infinite]" />
        </div>

        {/* Tips */}
        {tip && (
          <p className="mt-4 text-[11px] text-gray-500 text-center">{tip}</p>
        )}
      </div>

      {/* Keyframes for progress animation (using inline style tag) */}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-66%); }
          50% { transform: translateX(15%); }
          100% { transform: translateX(120%); }
        }
        @keyframes pulseSlow {
          0%,100% { opacity: .35; }
          50% { opacity: .6; }
        }
        .animate-pulseSlow { animation: pulseSlow 3.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
