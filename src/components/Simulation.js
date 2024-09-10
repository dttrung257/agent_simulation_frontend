import SimulationSelector from "./SimulationSelector";
import { useEffect, useState } from "react";

function Simulation({ nodeOptions, modelOptions }) {
  const [simulation, setSimulation] = useState({});

  const experimentOptions = ["Experiment 1", "Experiment 2", "Experiment 3"];

  const finalStepOptions = ["Final Step 1", "Final Step 2", "Final Step 3"];

  const handleChange = (e) => {
    setSimulation({ ...simulation, [e.target.name]: e.target.value });
    console.log(simulation);
  };

  const runSimulation = () => {
    console.log("Run simulation");
  };

  useEffect(() => {
    console.log(simulation);
  }, [simulation]);

  return (
    <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <SimulationSelector
          title="Node"
          name="node"
          disabled={false}
          options={nodeOptions}
          onChange={(e) => handleChange(e)}
        />
        <SimulationSelector
          title="Model"
          name="model"
          disabled={simulation.node == null}
          options={modelOptions}
          onChange={(e) => handleChange(e)}
        />
        <SimulationSelector
          title="Experiment"
          name="experiment"
          disabled={simulation.model == null}
          options={experimentOptions}
          onChange={(e) => handleChange(e)}
        />
        <SimulationSelector
          title="Final Step"
          name="finalStep"
          disabled={simulation.experiment == null}
          options={finalStepOptions}
          onChange={(e) => handleChange(e)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span></span>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
          onClick={runSimulation()}
        >
          Run Simulate
        </button>
      </div>
    </div>
  );
}

export default Simulation;
