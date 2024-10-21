import SimulationInput from "../layouts/SimulationInput";
import { useEffect, useRef, useState } from "react";
import {
  getExperimentList,
  runSimulation,
  getResultStatus,
} from "../api/simulationApi";
import Alert from "../layouts/Alert";
import { Link } from "react-router-dom";
import "ldrs/hourglass";
import { ring2 } from "ldrs";

function Simulation({ nodeOptions, modelOptions }) {
  const [simulation, setSimulation] = useState({});
  const [experimentOptions, setExperimentOptions] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState("");
  const [disableSimulation, setDisableSimulation] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [status, setStatus] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const interval = useRef(null);

  ring2.register();

  useEffect(() => {
    if (simulation.model) {
      getExperiments();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation.model]);

  useEffect(() => {
    if (status >= 3) {
      clearInterval(interval.current);
    }
  }, [status]);

  const getExperiments = () => {
    getExperimentList(process.env.REACT_APP_PROJECT_ID, simulation.model).then(
      (response) => {
        setExperimentOptions(response.data.data);
      }
    );
  };

  const handleChange = (e) => {
    setSimulation({ ...simulation, [e.target.name]: e.target.value });
  };

  const checkSimulationStatus = (resultId) => {
    interval.current = setInterval(async () => {
      await getResultStatus(resultId)
        .then((response) => {
          setWaiting(response.data.data.waiting);
          setStatus(() => response.data.data.status);
          setCurrentStep(response.data.data.currentStep);
          setProgress(
            (response.data.data.currentStep / simulation.finalStep) * 100
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

  const runSimulationEvent = async () => {
    console.log("Run simulation");
    setDisableSimulation(true);
    const experiments = [];
    const experiment = {
      id: simulation.experiment,
      modelId: simulation.model,
      finalStep: simulation.finalStep,
    };
    experiments.push(experiment);
    const projectId = process.env.REACT_APP_PROJECT_ID;
    const simulationInfo = {
      simulationRequests: [
        {
          nodeId: simulation.node,
          projectId: projectId,
          experiments: [
            {
              id: simulation.experiment,
              modelId: simulation.model,
              finalStep: simulation.finalStep,
            },
          ],
        },
      ],
    };
    setIsSimulationRunning(true);
    console.log(simulationInfo);
    await runSimulation(simulationInfo)
      .then((response) => {
        setIsSimulationRunning(true);
        setSimulationStatus("Success! Simulation is running.");
        setSimulation({
          ...simulation,
          resultId: response.data.data[0].experimentResultId,
        });
        checkSimulationStatus(response.data.data[0].experimentResultId);
      })
      .catch((error) => {
        error = true;
        setIsSimulationRunning(false);
        setSimulationStatus(error.response.data.message);
        setDisableSimulation(false);
        console.log(simulationStatus);
      });
  };

  return (
    <>
      <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow">
        <div className="grid grid-cols-4 gap-4">
          <SimulationInput
            title="Node"
            name="node"
            disabled={false}
            options={nodeOptions}
            onChange={(e) => handleChange(e)}
          />
          <SimulationInput
            title="Model"
            name="model"
            disabled={simulation.node == null}
            options={modelOptions}
            onChange={(e) => handleChange(e)}
          />
          <SimulationInput
            title="Experiment"
            name="experiment"
            disabled={simulation.model == null}
            options={experimentOptions}
            onChange={(e) => handleChange(e)}
          />
          <SimulationInput
            title="Final Step"
            name="finalStep"
            disabled={simulation.experiment == null}
            onChange={(e) => handleChange(e)}
          />
        </div>
      </div>
      <div className="block mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow">
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
          <div className="flex items-center pr-8">
            {isSimulationRunning && (
              <Alert type="success" content={simulationStatus} />
            )}
            {!isSimulationRunning && simulationStatus && (
              <Alert type="error" content={simulationStatus} />
            )}
          </div>
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
                      Play simulaion
                    </span>
                  </button>
                </Link>
              </>
            )}

            {status !== 3 && (
              <button
                className="text-white gap-4 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
                disabled={disableSimulation}
                onClick={() => runSimulationEvent()}
              >
                {isSimulationRunning && (
                  <l-ring-2
                    size="20"
                    stroke={3}
                    bg-opacity="0.1"
                    speed="1"
                    color="white"
                  ></l-ring-2>
                )}
                {!isSimulationRunning
                  ? "Run Simulation"
                  : "Running Simulation..."}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Simulation;
