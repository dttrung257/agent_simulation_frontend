import SimulationInput from "../layouts/SimulationInput";
import { useEffect, useState } from "react";
import { getExperimentList } from "../api/simulationApi";

function Simulation({ nodeOptions, modelOptions }) {
  const [simulation, setSimulation] = useState({});
  const [experimentOptions, setExperimentOptions] = useState([]);

  const getExperiments = () => {
    getExperimentList(process.env.REACT_APP_PROJECT_ID, simulation.model).then(
      (response) => {
        setExperimentOptions(response.data.data);
      }
    );
  };

  useEffect(() => {
    if (simulation.model) {
      getExperiments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulation]);

  const handleChange = (e) => {
    setSimulation({ ...simulation, [e.target.name]: e.target.value });
  };

  const runSimulation = () => {
    console.log("Run simulation");
    console.log(simulation);
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
        <span></span>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          onClick={runSimulation}
        >
          Run Simulate
        </button>
      </div>
    </div>
  );
}

export default Simulation;
