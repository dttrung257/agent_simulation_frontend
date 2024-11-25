import React, { useState, useRef } from "react";

const FarmPanoramaView = ({ resultImages, currentStep }) => {
  const [itemsPerView, setItemsPerView] = useState(3);
  const scrollContainerRef = useRef(null);
  const totalPens = Object.keys(resultImages).length;

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Calculate image size based on itemsPerView
  const calculateImageSize = () => {
    if (itemsPerView <= 3) return "w-1/3"; // Fixed size for 3 or fewer items

    // For more items, calculate smaller sizes
    const sizes = {
      4: "w-1/4",
      5: "w-1/5",
      6: "w-1/6",
    };
    return sizes[itemsPerView] || `w-[${100 / itemsPerView}%]`;
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-lg p-6 shadow-lg">
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Số lượng chuồng hiển thị:
        </label>
        <input
          type="range"
          min="3"
          max={Math.min(6, totalPens)}
          value={itemsPerView}
          onChange={(e) => setItemsPerView(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm text-gray-600">{itemsPerView}</span>
      </div>

      <div className="relative w-full">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-sky-200/30 to-transparent rounded-lg -z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/10 via-transparent to-transparent rounded-lg -z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/30 to-emerald-200/40 rounded-lg -z-10" />

        {/* Navigation buttons */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => handleScroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-24 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Object.entries(resultImages).map(([resultId, images], index) => (
            <div
              key={resultId}
              className={`flex-none snap-center transition-all duration-300 ${calculateImageSize()}`}
              style={{
                paddingLeft: index === 0 ? "0" : "4px",
                paddingRight: index === totalPens - 1 ? "0" : "4px",
              }}
            >
              {images.map((image, imageIndex) => (
                <div
                  key={imageIndex}
                  className="relative bg-white/95 shadow-xl rounded-lg border-2 border-slate-200 overflow-hidden h-full"
                >
                  <img
                    src={`data:image/jpeg;base64,${image.encodedImage}`}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-b-lg" />
      </div>
    </div>
  );
};

export default FarmPanoramaView;
