import React, { useState } from "react";

const FarmPanoramaView = ({ resultImages, currentStep }) => {
  const [itemsPerView, setItemsPerView] = useState(3); // Mặc định hiển thị 3 chuồng

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg p-6 shadow-lg">
      {/* Slider Control */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Số lượng chuồng hiển thị:
        </label>
        <input
          type="range"
          min="1"
          max={Object.keys(resultImages).length}
          value={itemsPerView}
          onChange={(e) => setItemsPerView(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm text-gray-600">{itemsPerView}</span>
      </div>

      <div className="relative w-full">
        {/* Enhanced sky gradient background with warmer tones */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-sky-200/30 to-transparent rounded-lg -z-10" />

        {/* Soft overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/10 via-transparent to-transparent rounded-lg -z-10" />

        {/* Ground/grass gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/30 to-emerald-200/40 rounded-lg -z-10" />

        {/* Enhanced Sun */}
        <div className="absolute -top-16 right-8 z-10">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-yellow-100 blur-xl opacity-60 animate-pulse" />

          {/* Main sun circle */}
          <div className="relative w-20 h-20">
            {/* Rays */}
            <div className="absolute inset-0 animate-spin-slow">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-amber-200 transform -translate-x-1/2"
                  style={{
                    left: "50%",
                    top: "50%",
                    transformOrigin: "50% 0",
                    rotate: `${i * 30}deg`,
                  }}
                />
              ))}
            </div>

            {/* Sun core with softer gradient */}
            <div className="absolute inset-2">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-orange-300 shadow-lg animate-pulse">
                <div className="relative w-full h-full">
                  <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-amber-600 rounded-full" />
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-amber-600 rounded-full" />
                  <div className="absolute bottom-1/3 left-1/2 w-6 h-6 -translate-x-1/2">
                    <div className="w-full h-full border-b-4 border-amber-600 rounded-full transform scale-x-75" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced clouds with better contrast */}
        <div className="absolute top-2 left-1/4 animate-float">
          {/* Main cloud body */}
          <div className="relative">
            <div className="w-32 h-10 bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-full shadow-md" />
            <div className="absolute bottom-0 w-32 h-10 bg-slate-400/10 rounded-full blur-sm transform translate-y-1" />
          </div>
          {/* Secondary cloud part */}
          <div className="relative -mt-4 ml-6">
            <div className="w-24 h-8 bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-full shadow-md" />
            <div className="absolute bottom-0 w-24 h-8 bg-slate-400/10 rounded-full blur-sm transform translate-y-1" />
          </div>
        </div>

        <div className="absolute top-6 left-2/3 animate-float-delayed">
          {/* Main cloud body */}
          <div className="relative">
            <div className="w-28 h-8 bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-full shadow-md" />
            <div className="absolute bottom-0 w-28 h-8 bg-slate-400/10 rounded-full blur-sm transform translate-y-1" />
          </div>
          {/* Secondary cloud part */}
          <div className="relative -mt-3 ml-4">
            <div className="w-20 h-6 bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-full shadow-md" />
            <div className="absolute bottom-0 w-20 h-6 bg-slate-400/10 rounded-full blur-sm transform translate-y-1" />
          </div>
        </div>

        {/* Enhanced grass patches */}
        <div className="absolute inset-x-0 bottom-0 h-32 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-emerald-600"
              style={{
                left: `${i * 5 + Math.random() * 4}%`,
                height: `${Math.random() * 20 + 20}px`,
                width: `${Math.random() * 10 + 15}px`,
                clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                opacity: 0.5 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>

        {/* Pigpens Container with dynamic width based on itemsPerView */}
        <div className="flex items-stretch justify-start gap-0 min-h-[400px] py-24 px-4 overflow-x-auto">
          {Object.entries(resultImages).map(([resultId, images], index) => (
            <div
              key={resultId}
              className="flex-none transition-all duration-300"
              style={{
                width: `${100 / itemsPerView}%`,
                minWidth: "200px", // Minimum width to ensure visibility
                maxWidth: "400px", // Maximum width to maintain quality
              }}
            >
              {images.map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className={`relative bg-white/95 shadow-xl border-2 border-slate-200
                    ${index === 0 ? "rounded-l-lg" : ""} 
                    ${
                      index === Object.entries(resultImages).length - 1
                        ? "rounded-r-lg"
                        : ""
                    }
                  `}
                  style={{
                    borderRight:
                      index !== Object.entries(resultImages).length - 1
                        ? "none"
                        : undefined,
                  }}
                >
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${image.encodedImage}`}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Enhanced ground shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-b-lg" />
      </div>
    </div>
  );
};

export default FarmPanoramaView;
