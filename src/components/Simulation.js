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
import { XMarkIcon } from "@heroicons/react/24/solid";

function Simulation({
  selectedProject,
  nodeOptions,
  modelOptions,
  index,
  removeSimulation,
  onSelectOption,
  selectSimulation,
}) {
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
    getExperimentList(selectedProject.id, simulation.model).then((response) => {
      setExperimentOptions(response.data.data);
    });
  };

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value);
    // setSimulation({ ...simulation, [e.target.name]: e.target.value });
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
      <div className="block p-6 mb-4 bg-white border border-gray-200 rounded-lg shadow">
        <div className="flex justify-between mb-2 items-center">
          <span>
            <input
              // disabled={simulation.finalStep == null}
              name={simulation}
              onChange={selectSimulation}
              type="checkbox"
              className="cursor-pointer accent-gray-500 size-5"
            />
          </span>
          <div
            onClick={removeSimulation}
            className="w-fit cursor-pointer items-center p-1 text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon className="size-6" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <SimulationInput
            title="Node"
            name="node"
            disabled={false}
            options={nodeOptions}
            onChange={onSelectOption}
          />
          <SimulationInput
            title="Model"
            name="model"
            disabled={simulation.node == null}
            options={modelOptions}
            onChange={onSelectOption}
          />
          <SimulationInput
            title="Experiment"
            name="experiment"
            disabled={simulation.model == null}
            options={experimentOptions}
            onChange={onSelectOption}
          />
          <SimulationInput
            title="Final Step"
            name="finalStep"
            disabled={simulation.experiment == null}
            onChange={onSelectOption}
          />
        </div>
      </div>
    </>
  );
}

export default Simulation;
