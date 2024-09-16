import AddSimulation from "../components/AddSimulation";
import Sidebar from "../layouts/Sidebar";
import Simulation from "../components/Simulation";
import { useEffect, useState } from "react";
import { getModelList, getModelOptions } from "../api/simulationApi";

function Project() {
  const workerNodeOptions = [{ name: "Master node", id: 1 }];
  const [modelOptions, setModelOptions] = useState([]);
  const [modelList, setModelList] = useState([]);

  const getModelOptionList = () => {
    getModelOptions(process.env.REACT_APP_PROJECT_ID, true).then((response) => {
      setModelOptions(response.data.data);
    });
  };

  const getModelListFromProject = () => {
    getModelList().then((response) => {
      setModelList(response.data.data);
    });
  };

  useEffect(() => {
    getModelOptionList();
    getModelListFromProject();
  }, []);

  return (
    <div className="h-screen w-screen">
      <Sidebar modelList={modelList} />
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
