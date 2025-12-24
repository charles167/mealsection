import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar that completes in ~2.5s
    const start = Date.now();
    const total = 2500;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setProgress(pct);
      if (pct < 100) rafId = requestAnimationFrame(tick);
    };

    let rafId = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, total);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-orange-50/40 to-white">
      {/* Top bar with logo and Skip */}
      <div className="relative z-10 flex items-center justify-between p-5">
        <img
          src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
          alt="MealSection Logo"
          className="w-36 md:w-44"
        />
      </div>

      {/* Soft animated blobs */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div className="absolute -top-20 -right-10 w-[28rem] h-[28rem] bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-10 w-[30rem] h-[30rem] bg-gradient-to-tr from-orange-200/40 to-rose-200/40 rounded-full blur-3xl animate-[pulse_3s_ease-in-out_infinite]" />
      </div>

      {/* Main hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="mb-8 animate-scaleIn drop-shadow-xl">
          <img
            src="https://png.pngtree.com/png-clipart/20230106/original/pngtree-delivery-boy-with-food-png-image_8876808.png"
            alt="Delivery"
            className="w-48 sm:w-56 md:w-64"
          />
        </div>
        <h1 className="text-center font-extrabold tracking-tight mb-3">
          <span className="block text-4xl  gradient-text">MealSection</span>
        </h1>
        <p className="text-center text-sm  text-gray-600 font-medium max-w-md">
          Fresh. Fast. Friendly. Your favorite meals, delivered with love.
        </p>

        {/* Feature pills */}
        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
          <div className="card-modern !py-3 text-center">
            <p className="text-[10px] font-semibold text-gray-700">
              Fast Delivery
            </p>
          </div>
          <div className="card-modern !py-3 text-center">
            <p className="text-[10px] font-semibold text-gray-700">
              Best Prices
            </p>
          </div>
          <div className="card-modern !py-3 text-center">
            <p className="text-[10px] font-semibold text-gray-700">
              Quality Food
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mt-10">
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            Loading experience… {progress}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
