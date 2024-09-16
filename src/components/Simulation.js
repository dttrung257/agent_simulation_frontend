import SimulationInput from "../layouts/SimulationInput";
import { useEffect, useState } from "react";
import {
  getExperimentList,
  runSimulation,
  getResultStatus,
} from "../api/simulationApi";
import Alert from "../layouts/Alert";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

function Simulation({ nodeOptions, modelOptions }) {
  const [simulation, setSimulation] = useState({});
  const [experimentOptions, setExperimentOptions] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState();
  const [disableSimulation, setDisableSimulation] = useState(false);

  useEffect(() => {
    if (simulation.model) {
      getExperiments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation]);

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

  const checkSimulationStatus = () => {
    getResultStatus(simulation.experiment)
      .then((response) => {
        console.log(response.data);
        response.data.status === "success"
          ? setSimulationStatus("Simulation complete! You can view the result.")
          : setSimulationStatus(
              "Simulation is running. Please wait for the results."
            );
      })
      .catch((error) => {
        console.log(error.response.data.message);
        setIsSimulationRunning(false);
        setSimulationStatus(error.response.data.message);
      });
  };

  const runSimulationEvent = () => {
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
      projectId,
      experiments,
    };
    console.log(simulationInfo);
    runSimulation(simulationInfo)
      .then((response) => {
        setIsSimulationRunning(true);
        setSimulationStatus("Success! Simulation is running.");
        console.log(response.data.data);
      })
      .catch((error) => {
        setIsSimulationRunning(false);
        setSimulationStatus(error.response.data.message);
        setDisableSimulation(false);
        console.log(simulationStatus);
      });
  };

  return (
    <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow">
      <div className="grid grid-cols-4 gap-4 mb-4">
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
          {isSimulationRunning &&
            simulationStatus.startsWith("Simulation complete!") && (
              <Link to={{ pathname: "/result", state: simulation }}>
                <button className="flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200">
                  <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                    View result
                  </span>
                </button>
              </Link>
            )}
          {isSimulationRunning &&
            !simulationStatus.startsWith("Simulation complete!")(
              <button
                onClick={() => checkSimulationStatus()}
                className="flex items-center gap-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2"
              >
                <ArrowPathIcon className="size-4 p-0 m-0" />
                Refresh
              </button>
            )}

          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            disabled={disableSimulation}
            onClick={() => runSimulationEvent()}
          >
            Run Simulate
          </button>
        </div>
      </div>
    </div>
  );
}

export default Simulation;
