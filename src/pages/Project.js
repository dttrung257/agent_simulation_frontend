import AddSimulation from "../components/AddSimulation";
import Sidebar from "../layouts/Sidebar";
import Simulation from "../components/Simulation";
import { useEffect, useState } from "react";
import {
  getModelList,
  getModelOptionsList,
  getNodeList,
} from "../api/simulationApi";

function Project({ selectedProject }) {
  const [nodeList, setNodeList] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [modelList, setModelList] = useState([]);

  const getModelOptions = async () => {
    await getModelOptionsList(process.env.REACT_APP_PROJECT_ID, true).then(
      (response) => {
        setModelOptions(response.data.data);
      }
    );
  };

  const getModel = async () => {
    await getModelList().then((response) => {
      setModelList(response.data.data);
    });
  };

  const getNode = async () => {
    await getNodeList().then((response) => {
      setNodeList(response.data.data);
    });
  };

  useEffect(() => {
    getModelOptions();
    getModel();
    getNode();
  }, []);

  return (
    <div className="h-screen w-screen">
      {selectedProject && (
        <div className="p-4 sm:ml-64">
          <h1 className="text-4xl font-semibold mb-4">
            {selectedProject.name}
          </h1>
          <Simulation nodeOptions={nodeList} modelOptions={modelOptions} />
          <AddSimulation />
        </div>
      )}
    </div>
  );
}

export default Project;
