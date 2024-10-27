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
import {
  ArrowDownTrayIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
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
  const interval = useRef(null);
  const waitForDownloadMessage =
    "Preparing your download... Please wait a moment.";
  const downloadReadyMessage = "Your results are ready for download!";
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
    }
    if (isSimulationRunning && status === 0 && currentStep === null) {
      checkSimulationStatus(simulation.resultId);
    }
  }, [isSimulationRunning, currentStep, status]);

  useEffect(() => {
    updateSimulation(currentSimulation, simulation.order);
  }, [currentSimulation]);

  const getExperiments = () => {
    getExperimentList(selectedProject.id, currentSimulation.modelId).then(
      (response) => {
        setExperimentOptions(response.data.data);
      }
    );
  };

  const checkSimulationStatus = (resultId) => {
    interval.current = setInterval(async () => {
      await getResultStatus(resultId)
        .then((response) => {
          setFinalStep(response.data.data.currentStep);

          setStatus(response.data.data.status);
          if (response.data.data.currentStep === null) {
            setCurrentStep(0);
          }
          if (response.data.data.currentStep !== null) {
            setCurrentStep(response.data.data.currentStep);
          }
          setProgress(
            (response.data.data.currentStep / simulation.finalStep) * 100
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }, 2000);
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
              onClick={removeSimulation}
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
        {currentStep !== null && (
          <div className="w-full">
            <div className="text-right font-medium text-lg mb-2 mt-4">
              {currentStep}/{simulation.finalStep}{" "}
              {simulation.finalStep >= 2 ? "steps" : "step"}
            </div>
            <div className="w-full mb-4 bg-gray-200 rounded-full h-2">
              <div
                style={{ width: `${progress}%` }}
                className="bg-blue-600 h-2 rounded-full "
              ></div>
            </div>
          </div>
        )}
        {(status === 3 || status === 5) && (
          <>
            <div className="flex items-center mt-4 justify-between">
              <div>
                {status !== 5 && downloadUrl === null && (
                  <Alert message={waitForDownloadMessage} type={"info"} />
                )}
                {status === 5 && downloadUrl !== null && (
                  <Alert message={downloadReadyMessage} type={"success"} />
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
                      View step-by-step
                    </span>
                  </button>
                </Link>
              </div>
            </div>
            <div>
              <p className="items-center mt-2 justify-end text-sm flex gap-1 text-orange-700">
                <InformationCircleIcon className="size-4" /> To view animation,
                you must download result file.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Simulation;
