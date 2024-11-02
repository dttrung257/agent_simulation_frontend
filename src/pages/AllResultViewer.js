import React from "react";
import { useEffect, useState, useRef } from "react";
import {
  getImageResultFromRange,
  getCategoriesResult,
  getExperimentResultDetail,
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
import { useNavigate, useParams } from "react-router-dom";

function AllResultViewer() {
  const { resultIds } = useParams();
  const resultIdArray = resultIds.split(",");
  const [currentStep, setCurrentStep] = useState(0);
  const [categoryId, setCategoryId] = useState({});
  const [inputStep, setInputStep] = useState(0);
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [maxFinalStep, setMaxFinalStep] = useState({});
  const [experimentResultDetails, setExperimentResultDetails] = useState({});
  const eventSourceRef = useRef(null);

  quantum.register();

  const formatRealTime = (step) => {
    const totalSeconds = step * 45;
    const days = Math.floor(totalSeconds / (24 * 3600));
    const remainingSeconds = totalSeconds % (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formattedDays = days.toString().padStart(2, "0");
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    return days > 0
      ? `Day ${formattedDays}, ${formattedHours}:${formattedMinutes}:${formattedSeconds}s`
      : `${formattedHours}:${formattedMinutes}:${formattedSeconds}s`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesPromises = resultIdArray.map(async (resultId) => {
        const response = await getCategoriesResult(resultId);
        return {
          resultId,
          categories: response.data.data.map((category) => ({
            id: category.id,
            name: category.name,
          })),
        };
      });

      const allCategories = await Promise.all(categoriesPromises);
      const categoryMap = {};
      allCategories.forEach((item) => {
        categoryMap[item.resultId] = item.categories;
      });
      setCategoryId(categoryMap);
    };

    fetchCategories();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const fetchExperimentResultDetail = async () => {
      try {
        const stepsPromises = resultIdArray.map(async (resultId) => {
          const response = await getExperimentResultDetail(resultId);
          return {
            resultId,
            finalStep: response.data.data.finalStep,
            experimentName: response.data.data.experimentName,
            modelName: response.data.data.modelName,
          };
        });

        const experimentResultDetails = await Promise.all(stepsPromises);
        const stepsMap = {};
        const experimentResultDetailMap = {};
        experimentResultDetails.forEach((item) => {
          stepsMap[item.resultId] = item.finalStep;
          experimentResultDetailMap[item.resultId] = item;
        });
        setMaxFinalStep(Math.max(...Object.values(stepsMap)) - 1);
        setExperimentResultDetails(experimentResultDetailMap);
      } catch (error) {
        console.error("Error fetching final steps:", error);
      }
    };

    fetchExperimentResultDetail();
  }, []);

  const startAnimation = () => {
    setIsPlaying(true);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const speedNanoseconds = speed * 1_000_000;

    const apiUrl = `${
      process.env.REACT_APP_API_URL
    }/experiment_result_images/multi_experiment_animation?experiment_result_id=${resultIdArray.join(
      ","
    )}&start_step=${currentStep}&end_step=${maxFinalStep}&duration=${speedNanoseconds}`;

    const eventSource = new EventSource(apiUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.steps && data.steps.length > 0) {
        const step = data.steps[0];
        setCurrentStep(step.step);

        const newImages = {};
        step.categories.forEach((category) => {
          if (!newImages[category.experimentResultId]) {
            newImages[category.experimentResultId] = [];
          }

          const categoryName = categoryId[category.experimentResultId]?.find(
            (cat) => cat.id === category.categoryId
          )?.name;

          if (categoryName?.toLowerCase().includes("simulator")) {
            if (!newImages[category.experimentResultId]) {
              newImages[category.experimentResultId] = [];
            }
            newImages[category.experimentResultId].push({
              id: category.categoryId,
              encodedImage: category.encodedImage,
              name: categoryName,
            });
          }
        });

        setImages(newImages);
      }
    };

    eventSource.onerror = () => {
      stopAnimation();
    };

    eventSourceRef.current = eventSource;
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
    setCurrentStep(maxFinalStep);
    setInputStep(maxFinalStep);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    if (isPlaying) {
      stopAnimation();
      setTimeout(startAnimation, 0);
    }
  };

  const getImagesForAllResults = async () => {
    if (Object.keys(categoryId).length === 0) return;

    setLoading(true);
    try {
      const imagePromises = resultIdArray.map((resultId) =>
        getImageResultFromRange(resultId, currentStep, currentStep)
      );

      const responses = await Promise.all(imagePromises);

      const newImages = {};
      responses.forEach((response, index) => {
        const resultId = resultIdArray[index];
        const categories = response.data.data.steps[0].categories;

        const simulatorImages = categories
          .filter((category) => {
            const categoryName = categoryId[resultId]?.find(
              (cat) => cat.id === category.categoryId
            )?.name;
            return categoryName?.toLowerCase().includes("simulator");
          })
          .map((category) => ({
            id: category.categoryId,
            encodedImage: category.encodedImage,
            name: categoryId[resultId]?.find(
              (cat) => cat.id === category.categoryId
            )?.name,
          }));

        if (simulatorImages.length > 0) {
          newImages[resultId] = simulatorImages;
        }
      });

      setImages(newImages);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      getImagesForAllResults();
    }
  }, [currentStep, categoryId, isPlaying]);

  const handleChange = (e) => {
    setError(false);
    setInputStep(parseInt(e.target.value));
  };

  const handleStepInput = () => {
    if (inputStep > maxFinalStep || inputStep < 0) {
      setError(true);
      return;
    }
    setCurrentStep(inputStep);
  };

  return (
    <div>
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
          <span className="text-sm font-medium text-gray-900">
            {Math.round((speed / 1000) * 100) / 100}s
          </span>
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
            if (currentStep < maxFinalStep) {
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
          value={inputStep}
          onChange={handleChange}
          disabled={isPlaying}
          className="block w-full p-4 ps-10 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-50 disabled:opacity-50"
          placeholder={`Step 0 (${formatRealTime(
            0
          )}) to ${maxFinalStep} (${formatRealTime(maxFinalStep)})`}
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

      {error && (
        <div className="max-w-xl mx-auto">
          <p className="mt-2 text-sm text-red-600">
            <span className="font-medium">
              Invalid input! Please choose step between 0 and {maxFinalStep}
            </span>
          </p>
        </div>
      )}

      {loading ? (
        <div className="h-screen w-screen place-content-center">
          <div className="flex justify-center">
            <l-quantum size="250" speed="1.75" color="#3b82f6"></l-quantum>
          </div>
        </div>
      ) : (
        <div
          className={`grid ${
            resultIdArray.length === 1
              ? "grid-cols-1 max-w-3xl"
              : resultIdArray.length === 2
              ? "grid-cols-2 max-w-5xl"
              : "grid-cols-3 max-w-[90%]"
          } gap-8 mx-auto p-8`}
        >
          {resultIdArray.map((resultId, resultIndex) => (
            <div
              key={resultId}
              className="border rounded-lg p-6 bg-white shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                {experimentResultDetails[resultId]?.experimentName}
              </h2>
              <div className="flex flex-wrap gap-6 items-start justify-center">
                {images[resultId]?.map((image, imageIndex) => (
                  <div key={imageIndex} className="flex flex-col items-center">
                    <div className="bg-white border w-fit p-4 border-gray-300 rounded-lg shadow-md">
                      <img
                        alt={image.name}
                        src={`data:image/jpeg;base64,${image.encodedImage}`}
                        className="max-w-full h-auto"
                      />
                    </div>
                    <h3 className="text-lg font-medium mt-3 text-gray-700">
                      {image.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllResultViewer;
