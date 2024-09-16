import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

function Carousel({ slides }) {
  let [current, setCurrent] = useState(0);

  let previousSlide = () => {
    if (current === 0) setCurrent(slides.length - 1);
    else setCurrent(current - 1);
  };

  let nextSlide = () => {
    if (current === slides.length - 1) setCurrent(0);
    else setCurrent(current + 1);
  };

  return (
    <div key={slides} className="overflow-hidden relative">
      <div
        className={`flex transition ease-out duration-40`}
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((img) => {
          return (
            <img src={img.imageUrl} alt={img.imageUrl} id={img.imageUrl} />
          );
        })}
      </div>

      <div className="absolute top-0 h-full w-full justify-between items-center flex px-10 text-3xl">
        <button
          className="bg-slate-50 text-gray-500 opacity-80 hover:bg-gray-100 size-8 rounded-full"
          onClick={previousSlide}
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="bg-slate-50 text-gray-500 opacity-80 hover:bg-gray-100 size-8 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className=" bottom-0 py-4 flex justify-center gap-3 w-full">
        {slides.map((s, i) => {
          return (
            <div
              onClick={() => {
                setCurrent(i);
              }}
              key={"circle" + i}
              className={`rounded-full w-3 h-3 cursor-pointer  ${
                i === current ? "bg-gray-200" : "bg-gray-500"
              }`}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default Carousel;
