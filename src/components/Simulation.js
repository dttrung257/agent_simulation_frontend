import SimulationInput from "../layouts/SimulationInput";
import { useEffect, useRef, useState } from "react";
import { getExperimentList, getResultStatus } from "../api/simulationApi";
import Alert from "../layouts/Alert";
import { Link } from "react-router-dom";
import "ldrs/hourglass";
import { ring2 } from "ldrs";
import { XMarkIcon } from "@heroicons/react/24/solid";

function Simulation({
  selectedProject,
  nodeOptions,
  modelOptions,
  index,
  simulation,
  removeSimulation,
  isSimulationRunning,
  updateSimulation,
}) {
  const [experimentOptions, setExperimentOptions] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(simulation);
  const [simulationStatus, setSimulationStatus] = useState("");
  const [waiting, setWaiting] = useState(true);
  const [status, setStatus] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const interval = useRef(null);

  ring2.register();

  useEffect(() => {
    if (currentSimulation.modelId) {
      getExperiments();
    }
    setCurrentSimulation({ ...currentSimulation, experimentId: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSimulation.modelId]);

  useEffect(() => {
    if (simulation.status >= 3) {
      clearInterval(interval.current);
      return;
    }
    if (simulation.status < 3 && simulation.status > 0) {
      checkSimulationStatus(simulation.resultId);
    }
  }, [simulation.status]);

  useEffect(() => {
    console.log(currentSimulation);
    updateSimulation(currentSimulation, index);
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
          setWaiting(response.data.data.waiting);
          setStatus(() => response.data.data.status);
          setCurrentStep(response.data.data.currentStep);
          setProgress(
            (response.data.data.currentStep / currentSimulation.finalStep) * 100
          );
          if (response.data.data.status === 3) {
            setSimulationStatus(
              "Simulation completed successfully. Results are now ready for viewing."
            );
          }
        })
        .catch((error) => {
          console.log(error);
          setSimulationStatus("Run simulation failed. Please try again.");
          setStatus(4);
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

  return (
    <>
      <div className="block p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex justify-end mb-2 items-center">
          <button
            onClick={removeSimulation}
            value={index}
            className="w-fit cursor-pointer items-center p-1 text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <div>
              <XMarkIcon value={index} className="size-6" />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <SimulationInput
            title="Node"
            name="nodeId"
            disabled={false}
            currentValue={simulation.nodeId}
            options={nodeOptions}
            onChange={handleChange}
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
          />
          <SimulationInput
            title="Final Step"
            name="finalStep"
            currentValue={simulation.finalStep}
            onChange={handleChange}
          />
        </div>
        {!waiting && (
          <div className="w-full">
            <div className="text-right font-medium text-lg mb-2">
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

        <div className="flex items-center justify-between">
          <div className="place-items-center grid grid-flow-col">
            {!waiting && status === 3 && (
              <>
                <Link
                  to={{
                    pathname: "/view-steps",
                  }}
                  state={simulation}
                >
                  <button className="flex hover:cursor-pointer items-center justify-center p-0.5 me-2 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                      View step-by-step
                    </span>
                  </button>
                </Link>
                <Link
                  to={{
                    pathname: "/play-animation",
                  }}
                  state={simulation}
                >
                  <button className="flex hover:cursor-pointer items-center justify-center p-0.5 me-2 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white focus:ring-4 focus:outline-none focus:ring-pink-200">
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                      Play simulation
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Simulation;
