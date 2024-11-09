import SimulationInput from "../layouts/SimulationInput";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadSimulationResultURL,
  getExperimentList,
  getResultStatus,
  stopSimulation,
} from "../api/simulationApi";
import { Link } from "react-router-dom";
import "ldrs/hourglass";
import { ring2 } from "ldrs";
import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Alert from "../layouts/Alert";

function Simulation({
  selectedProject,
  nodeOptions,
  modelOptions,
  simulation,
  removeSimulation,
  isSimulationRunning,
  updateSimulation,
  checkSimulationFinish,
}) {
  const [experimentOptions, setExperimentOptions] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(simulation);
  const [currentStep, setCurrentStep] = useState(null);
  const [finalStep, setFinalStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const interval = useRef(null);
  const PREPARE_DATA_FOR_DOWNLOAD_MESSAGE =
    "Preparing your data... Please wait a moment.";
  const READY_FOR_DOWNLOAD_MESSAGE = "Your results are ready for download!";
  const STARTING_GAMA_HEADLESS_MESSAGE = "Starting GAMA headless...";
  const SIMULATION_IS_RUNNING_MESSAGE = "Simulation is running...";
  const SAVING_RESULT_MESSAGE = "Saving result...";
  const RUN_FAIL = "Simulation failed to run. Please try again.";
  const [isSimulationStopped, setIsSimulationStopped] = useState(false);

  ring2.register();

  useEffect(() => {
    if (currentSimulation.modelId) {
      getExperiments();
    }
    setCurrentSimulation({ ...currentSimulation, experimentId: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSimulation.modelId]);

  useEffect(() => {
    if (status === 5) {
      clearInterval(interval.current);
      getDownloadResultURL();
      checkSimulationFinish();
      return;
    } else if (hasError) {
      clearInterval(interval.current);
      checkSimulationFinish();
      return;
    }
    if (
      isSimulationRunning &&
      status === 0 &&
      currentStep === null &&
      simulation.resultId
    ) {
      checkSimulationStatus(simulation.resultId);
    }
  }, [isSimulationRunning, currentStep, status, hasError]);

  useEffect(() => {
    updateSimulation(currentSimulation, simulation.order);
  }, [currentSimulation]);

  useEffect(() => {
    if (isSimulationRunning && !simulation.resultId) {
      setHasError(true);
    }
  }, [isSimulationRunning, simulation.resultId]);

  const getExperiments = () => {
    getExperimentList(selectedProject.id, currentSimulation.modelId).then(
      (response) => {
        setExperimentOptions(response.data.data);
      }
    );
  };

  const checkSimulationStatus = (resultId) => {
    const updateStatus = async () => {
      try {
        const response = await getResultStatus(resultId);
        const data = response.data.data;

        setFinalStep(data.currentStep);
        setStatus(data.status);

        const currentStep = data.currentStep ?? 0;
        setCurrentStep(currentStep);

        let progress = (currentStep / simulation.finalStep) * 100;
        progress = progress > 100 ? 100 : progress;
        setProgress(progress);

        if (data.status === 2 && data.currentStep === null) {
          clearInterval(interval.current);
          interval.current = setInterval(updateStatus, 3000);
        }

        if (
          (data.status === 2 && data.currentStep === finalStep) ||
          data.status === 3
        ) {
          clearInterval(interval.current);
          interval.current = setInterval(updateStatus, 700);
        }
      } catch (error) {
        console.log(error);
        setHasError(true);
        clearInterval(interval.current);
      }
    };

    interval.current = setInterval(updateStatus, 2000);
  };

  const handleChange = (e) => {
    if (e.target.name !== "finalStep") {
      setCurrentSimulation({
        ...currentSimulation,
        [e.target.name]: parseInt(e.target.value),
      });
      return;
    }
    if (
      e.target.name === "finalStep" &&
      e.target.value > 0 &&
      e.target.value <= 100000
    ) {
      setCurrentSimulation({
        ...currentSimulation,
        [e.target.name]: parseInt(e.target.value),
      });
    } else {
    }
  };

  const getDownloadResultURL = async () => {
    await getDownloadSimulationResultURL(simulation.resultId)
      .then((response) => {
        setDownloadUrl(response.data.data.downloadUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const stopSimulationOnClick = async (e) => {
    await stopSimulation(simulation.resultId)
      .then(() => {
        setIsSimulationStopped(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div key={simulation.order}>
      <div className="block p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex justify-end mb-4 items-center">
          {currentStep > 0 &&
            currentStep < simulation.finalStep &&
            isSimulationRunning &&
            status === 2 && (
              <button
                disabled={isSimulationStopped}
                onClick={() => stopSimulationOnClick()}
                className="focus:outline-none disabled:cursor-not-allowed disabled:bg-red-300 items-center flex gap-2 text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-md px-5 py-2.5"
              >
                <XMarkIcon className="size-5" />
                Stop simulation
              </button>
            )}
          {!isSimulationRunning && (
            <button
              onClick={() => removeSimulation(simulation.order)}
              className="w-fit cursor-pointer items-center p-1 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <div>
                <XMarkIcon value={simulation.order} className="size-6" />
              </div>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <SimulationInput
            title="Node"
            name="nodeId"
            disabled={false}
            currentValue={simulation.nodeId}
            options={nodeOptions}
            onChange={handleChange}
            isSimulationRunning={isSimulationRunning}
          />
          <SimulationInput
            title="Model"
            name="modelId"
            disabled={simulation.nodeId == null}
            currentValue={simulation.modelId}
            options={modelOptions}
            onChange={handleChange}
          />
          <SimulationInput
            title="Experiment"
            name="experimentId"
            disabled={simulation.modelId == null}
            currentValue={simulation.experimentId}
            options={experimentOptions}
            onChange={handleChange}
            isSimulationRunning={isSimulationRunning}
          />
          <SimulationInput
            title="Final Step"
            name="finalStep"
            currentValue={simulation.finalStep}
            onChange={handleChange}
            isSimulationRunning={isSimulationRunning}
          />
        </div>
        {currentStep !== null && !hasError && (
          <div className="w-full">
            <div className="flex justify-end items-center font-medium text-lg mb-2 mt-4">
              <span className="text-teal-600 font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full mb-4 bg-gray-100 rounded-full h-3 relative overflow-hidden shadow-inner">
              <div
                style={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-green-400 transition-all duration-500 ease-out relative group"
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-teal-400/20 to-green-400/20 blur-sm"></div>

                {/* Arrow head */}
                <div className="absolute -right-1.5 top-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-teal-400 to-green-400 transform rotate-45 w-3 h-3 shadow-lg"></div>
                </div>

                {/* Pulse effect at the end */}
                <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                  <div className="absolute size-4 bg-teal-500/30 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Add keyframes for shimmer animation */}
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-shimmer {
                animation: shimmer 2s infinite;
              }
            `}</style>
          </div>
        )}
        {hasError && <Alert message={RUN_FAIL} type={"error"} />}
        {status === 2 && !hasError && (
          <>
            <div className="flex items-center mt-4 justify-between">
              <div>
                {currentStep === 0 && (
                  <Alert
                    message={STARTING_GAMA_HEADLESS_MESSAGE}
                    type={"info"}
                  />
                )}
                {currentStep > 0 && currentStep < simulation.finalStep && (
                  <Alert
                    message={SIMULATION_IS_RUNNING_MESSAGE}
                    type={"info"}
                  />
                )}
                {currentStep === simulation.finalStep && (
                  <Alert message={SAVING_RESULT_MESSAGE} type={"info"} />
                )}
              </div>
            </div>
          </>
        )}
        {(status === 3 || status === 5) && !hasError && (
          <>
            <div className="flex items-center mt-4 justify-between">
              <div>
                {status !== 5 && downloadUrl === null && (
                  <Alert
                    message={PREPARE_DATA_FOR_DOWNLOAD_MESSAGE}
                    type={"info"}
                  />
                )}
                {status === 5 && downloadUrl !== null && (
                  <Alert
                    message={READY_FOR_DOWNLOAD_MESSAGE}
                    type={"success"}
                  />
                )}
              </div>
              <div className="place-items-center gap-4 grid grid-flow-col">
                {downloadUrl !== null && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200"
                  >
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                      <ArrowDownTrayIcon className="size-6" />
                    </span>
                  </a>
                )}
                <Link
                  to={{
                    pathname: `/result/${simulation.resultId}/view-steps`,
                    search: `?finalStep=${finalStep}`,
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="flex hover:cursor-pointer items-center justify-center p-0.5 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                      View Result
                    </span>
                  </button>
                </Link>
              </div>
            </div>
            {/* <div>
              <p className="items-center mt-2 justify-end text-sm flex gap-1 text-orange-700">
                <InformationCircleIcon className="size-4" /> To view animation,
                you must download result file.
              </p>
            </div> */}
          </>
        )}
      </div>
    </div>
  );
}

export default Simulation;
