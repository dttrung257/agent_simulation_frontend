import AddSimulation from "../components/AddSimulation";
import Sidebar from "../layouts/Sidebar";
import Simulation from "../components/Simulation";
import { useEffect, useState } from "react";
import { getModelList } from "../api/simulationApi";

function Project() {
  const workerNodeOptions = [{ name: "Master node", id: 1 }];
  const [modelOptions, setModelOptions] = useState([]);

  const getModels = () => {
    getModelList().then((response) => {
      setModelOptions(response.data.data);
    });
  };

  useEffect(() => {
    getModels();
  }, []);

  return (
    <div>
      <Sidebar modelList={modelOptions} />
      <div className="p-4 sm:ml-64">
        <h1 className="text-4xl font-semibold mb-4">Project</h1>
        <Simulation
          nodeOptions={workerNodeOptions}
          modelOptions={modelOptions}
        />
        <AddSimulation />
      </div>
    </div>
  );
}

export default Project;
