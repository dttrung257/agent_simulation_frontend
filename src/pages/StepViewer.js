import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  getImageResultFromRange,
  getCategoriesResult,
} from "../api/simulationApi";
import {
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

import { quantum } from "ldrs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function StepViewer() {
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();
  const finalStep = parseInt(searchParams.get("finalStep"));
  const [currentStep, setCurrentStep] = useState(0);
  const [categoryId, setCategoryId] = useState([]);
  const [inputStep, setInputStep] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100); // Default speed: 100 milliseconds = 0.1 seconds
  const eventSourceRef = useRef(null);

  quantum.register();

  const formatRealTime = (step) => {
    // 1 step = 45 seconds
    const totalSeconds = step * 45;
    
    const days = Math.floor(totalSeconds / (24 * 3600));
    const remainingSeconds = totalSeconds % (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
  
    const formattedDays = days.toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return days > 0 
      ? `Day ${formattedDays}, ${formattedHours}:${formattedMinutes}:${formattedSeconds}s`
      : `${formattedHours}:${formattedMinutes}:${formattedSeconds}s`;
  };

  useEffect(() => {
    if (currentStep === 0) {
      const getCategories = async () => {
        await getCategoriesResult(resultId).then((response) => {
          response.data.data.forEach((category) => {
            setCategoryId((prevCategoryId) => [
              ...prevCategoryId,
              { id: category.id, name: category.name },
            ]);
          });
        });
      };
      getCategories();
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startAnimation = () => {
    setIsPlaying(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const endStep = finalStep - 1;
    const speedNanoseconds = speed * 1_000_000;
    const apiUrl = `${process.env.REACT_APP_API_URL}/experiment_result_images/multi_experiment_animation?experiment_result_id=${resultId}&start_step=${currentStep}&end_step=${endStep}&duration=${speedNanoseconds}`;
    
    eventSourceRef.current = new EventSource(apiUrl);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.steps && data.steps.length > 0) {
        const step = data.steps[0];
        setCurrentStep(step.step);
        
        const newImages = step.categories.map(category => {
          const categoryName = categoryId.find(
            (cat) => cat.id === category.categoryId
          )?.name;
          return {
            id: category.categoryId,
            encodedImage: category.encodedImage,
            name: categoryName,
          };
        });
        
        setImages(newImages);
      }
    };

    eventSourceRef.current.onerror = () => {
      stopAnimation();
    };
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const resetToStart = () => {
    stopAnimation();
    setCurrentStep(0);
    setInputStep(0);
  };

  const goToEnd = () => {
    stopAnimation();
    setCurrentStep(finalStep - 1);
    setInputStep(finalStep - 1);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (isPlaying) {
      // Restart animation with new speed
      stopAnimation();
      setTimeout(startAnimation, 0);
    }
  };

  const getImages = async () => {
    if (categoryId.length !== 0) {
      setLoading(true);
      await getImageResultFromRange(resultId, currentStep, currentStep).then(
        (response) => {
          const newImages = [];
          response.data.data.steps.forEach((step) => {
            step.categories.forEach((category) => {
              const categoryName = categoryId.find(
                (cat) => cat.id === category.categoryId
              )?.name;
              newImages.push({
                id: category.categoryId,
                encodedImage: category.encodedImage,
                name: categoryName,
              });
            });
          });
          setImages(newImages);
        }
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      setImages([]);
      getImages();
    }
  }, [currentStep, categoryId, isPlaying]);

  const handleChange = (e) => {
    setError(false);
    setInputStep(parseInt(e.target.value));
  };

  const handleStepInput = () => {
    if (inputStep > parseInt(finalStep) - 1 || inputStep < 0) {
      setError(true);
      return;
    }
    setCurrentStep(inputStep);
  };

  return (
    <div>
      {/* <h1 className="text-center text-7xl font-semibold mt-24 mb-6">
        Step Viewer
      </h1> */}
      <button
        type="button"
        className="fixed top-8 left-8 flex gap-2 text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
        onClick={() => navigate("/")}
      >
        <ArrowUturnLeftIcon className="size-5" />
        Back to home
      </button>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-center text-4xl font-semibold mt-12">
          Step: {currentStep}
        </h1>
        <div className="flex items-center gap-2 text-2xl text-gray-600">
          <ClockIcon className="size-6" />
          <span>{formatRealTime(currentStep)}</span>
        </div>
      </div>
      
      <div className="mx-auto max-w-xl mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-900">Speed</span>
          <input
            type="range"
            min="10"
            max="5001"
            step="10"
            value={speed}
            onChange={handleSpeedChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-900">{Math.round((speed  / 1000) * 100) / 100}s</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
          {/* <span>{formatRealTime(0)}</span>
          <span>{formatRealTime(finalStep - 1)}</span> */}
        </div>
      </div>
      
      <div className="mx-auto relative w-fit place-content-center flex gap-2">
        <button
          type="button"
          onClick={resetToStart}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <BackwardIcon className="size-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            }
          }}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        
        <button
          type="button"
          onClick={isPlaying ? stopAnimation : startAnimation}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          {isPlaying ? (
            <PauseIcon className="size-5" />
          ) : (
            <PlayIcon className="size-5" />
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {
            if (currentStep < parseInt(finalStep) - 1) {
              setCurrentStep(currentStep + 1);
            }
          }}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
        >
          <ChevronRightIcon className="size-5" />
        </button>

        <button
          type="button"
          onClick={goToEnd}
          disabled={isPlaying}
          className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
          title="Go to end"
        >
          <ForwardIcon className="size-5" />
        </button>
      </div>

      <div className="mx-auto relative max-w-xl place-content-center mt-4">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <MagnifyingGlassIcon className="size-5 text-gray-900" />
        </div>

        <input
          type="number"
          id="search"
          value={inputStep}
          onChange={handleChange}
          disabled={isPlaying}
          className="block w-full p-4 ps-10 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-50 disabled:opacity-50"
          // placeholder={`Step 0 to ${finalStep - 1}`}
          placeholder={`Step 0 (${formatRealTime(0)}) to ${finalStep - 1} (${formatRealTime(finalStep - 1)})`} 
          required
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-4 py-2 disabled:opacity-50"
          onClick={handleStepInput}
          disabled={isPlaying}
        >
          View step
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        {error && (
          <p className="mt-2 text-sm text-red-600">
            <span className="font-medium">
              Invalid input! Please choose step between 0 and {finalStep - 1}
            </span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="h-screen w-screen place-content-center">
          <div className="flex justify-center">
            <l-quantum size="250" speed="1.75" color="#3b82f6"></l-quantum>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 items-center place-content-center mx-4 my-12">
          {images.map((image, index) => (
            <div key={index}>
              <div className="mx-auto bg-white border w-fit p-5 border-gray-300 rounded-lg shadow-xl">
                <img
                  alt={image.name}
                  src={`data:image/jpeg;base64,${image.encodedImage}`}
                />
              </div>
              <h1 className="text-center text-2xl my-4">{image.name}</h1>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StepViewer;
