import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getImageResultFromRange,
  getCategoriesResult,
} from "../api/simulationApi";
import { PlayIcon } from "@heroicons/react/24/solid";
import { quantum } from "ldrs";

function AnimationPlayer() {
  const data = useLocation();
  const simulation = data.state;
  const [currentStep, setCurrentStep] = useState(-1);
  const [endStep, setEndStep] = useState(0);
  const [images, setImages] = useState([]);
  const [playImage, setPlayImage] = useState("");
  const [play, setPlay] = useState(false);
  const [simulationCategoryId, setSimulationCategoryId] = useState(-1);
  const [loading, setLoading] = useState(true);
  const interval = useRef();

  quantum.register();

  useEffect(() => {
    setEndStep(simulation.finalStep);
    // if (simulation.finalStep < 9) {
    //   setEndStep(simulation.finalStep);
    // } else {
    //   setEndStep(8);
    // }
    const getCategories = async () => {
      await getCategoriesResult(simulation.resultId).then((response) => {
        setSimulationCategoryId(
          response.data.data.find((category) =>
            category.name.startsWith("Simulator")
          ).id
        );
      });
    };

    if (simulationCategoryId < 0) {
      getCategories();
      setCurrentStep(0);
    }
  }, []);

  useEffect(() => {
    // if (currentStep >= 0) {
    getImages();
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationCategoryId]);

  useEffect(() => {
    if (images.length == simulation.finalStep) {
      setLoading(false);
    }
  }, [images.length]);

  useEffect(() => {
    if (play && currentStep === 0) {
      const showImages = () => {
        interval.current = setInterval(() => {
          console.log(currentStep);
          setCurrentStep((currentStep) => currentStep + 1);
        }, 1000);
      };
      if (!loading) {
        if (currentStep >= 0) {
          showImages();
        }
      }
    }
    const finalStep = parseInt(simulation.finalStep);

    if (currentStep + 1 === finalStep && interval.current) {
      clearInterval(interval.current);
    }
  }, [play, currentStep]);

  const getImages = async () => {
    await getImageResultFromRange(
      simulation.resultId,
      currentStep,
      endStep
    ).then((response) => {
      response.data.data.steps.forEach((step, id) => {
        step.categories.forEach((category, id) => {
          if (category.categoryId === simulationCategoryId) {
            setImages((images) => [...images, category.encodedImage]);
          }
        });
      });
    });
  };

  const playSimulation = (imagePlayer) => {
    setPlay(true);
    // images.forEach((image, index) => {
    //   setTimeout(() => {
    //     console.log(image.substring(100, 110));
    //     setPlayImage(image);
    //   }, 5000);
    // });
  };

  return (
    <>
      {loading ? (
        <div className="h-screen w-screen place-content-center">
          <div className="flex justify-center">
            <l-quantum size="250" speed="1.75" color="#3b82f6"></l-quantum>
          </div>
        </div>
      ) : (
        <div className="h-screen w-screen justify-items-center place-content-center">
          {!play && (
            <div className="flex justify-center mb-12">
              <button
                className="flex items-center justify-center p-0.5 overflow-hidden text-lg font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-200"
                onClick={() => playSimulation(images)}
              >
                <span className="flex px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                  <PlayIcon className="size-6 mr-2" />
                  <div>Play simulation</div>
                </span>
              </button>
            </div>
          )}
          {play && (
            <div>
              <div className="mx-auto w-fit text-4xl mb-4 font-medium">
                Step: {currentStep + 1}
              </div>

              <div className="mx-auto bg-white border w-fit p-5 border-gray-300 rounded-lg shadow-2xl">
                <img
                  alt="simulator"
                  src={`data:image/jpeg;base64,${images[currentStep]}`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default AnimationPlayer;
