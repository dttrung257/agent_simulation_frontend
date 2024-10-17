import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getImageResultFromRange,
  getCategoriesResult,
} from "../api/simulationApi";
import {
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { quantum } from "ldrs";
import { useNavigate } from "react-router-dom";

function StepViewer() {
  const simulation = useLocation().state;
  const [currentStep, setCurrentStep] = useState(0);
  const [categoryId, setCategoryId] = useState([]);
  const [inputStep, setInputStep] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  quantum.register();

  useEffect(() => {
    if (currentStep === 0) {
      const getCategories = async () => {
        await getCategoriesResult(simulation.resultId).then((response) => {
          response.data.data.forEach((category, id) => {
            setCategoryId((categoryId) => [
              ...categoryId,
              { id: category.id, name: category.name },
            ]);
          });
        });
      };
      getCategories();
    }
  }, []);

  const getImages = async () => {
    if (categoryId.length !== 0) {
      setLoading(true);
      await getImageResultFromRange(
        simulation.resultId,
        currentStep,
        currentStep
      ).then((response) => {
        response.data.data.steps.forEach((step, id) => {
          step.categories.forEach((category, id) => {
            const categoryName = categoryId.find(
              (categoryName) => categoryName.id === category.categoryId
            ).name;
            setImages((images) => [
              ...images,
              {
                id: category.categoryId,
                encodedImage: category.encodedImage,
                name: categoryName,
              },
            ]);
          });
        });
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    setImages([]);
    getImages();
  }, [currentStep, categoryId]);

  const handleChange = (e) => {
    setError(false);
    setInputStep(e.target.value);
  };

  const handleStepInput = () => {
    if (inputStep > parseInt(simulation.finalStep)) {
      setError(true);
      return;
    }
    setCurrentStep(inputStep);
  };

  return (
    <div>
      <h1 className="text-center text-7xl font-semibold mt-24 mb-6 place-content-center">
        Step Viewer
      </h1>
      <button
        type="button"
        className="mx-auto flex gap-2 text-gray-900 bg-white focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={() => navigate("/")}
      >
        <ArrowUturnLeftIcon className="size-5" />
        Back to home
      </button>

      <h1 className="text-center text-4xl font-semibold my-12 place-content-center">
        Step: {currentStep}
      </h1>

      <div className="mx-auto relative max-w-xl place-content-center">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <MagnifyingGlassIcon className="size-5 text-gray-900" />
        </div>
        <input
          type="number"
          id="search"
          onChange={(e) => handleChange(e)}
          className="block w-full p-4 ps-10 text-md text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={`Step 1 to ${simulation.finalStep}`}
          required
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => handleStepInput()}
        >
          View step
        </button>
      </div>
      <div className="max-w-xl mx-auto">
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            <span className="font-medium">
              Invalid input! Pleaase choose step between 0 and{" "}
              {simulation.finalStep}
            </span>{" "}
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
          {images.map((image, index) => {
            return (
              <div>
                <div className="mx-auto bg-white border w-fit p-5 border-gray-300 rounded-lg shadow-xl">
                  <img
                    alt={image.name}
                    src={`data:image/jpeg;base64,${image.encodedImage}`}
                  />
                </div>
                <h1 className="text-center text-2xl my-4">{image.name}</h1>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StepViewer;
