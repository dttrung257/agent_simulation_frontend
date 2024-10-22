import AddSimulation from "../components/AddSimulation";
import Alert from "../layouts/Alert";
import { Link } from "react-router-dom";
import Simulation from "../components/Simulation";
import { useEffect, useState, useRef } from "react";
import {
  getModelList,
  getModelOptionsList,
  getNodeList,
} from "../api/simulationApi";

function Project({ selectedProject }) {
  const [nodeList, setNodeList] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [simulation, setSimulation] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [disableSimulation, setDisableSimulation] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [status, setStatus] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const interval = useRef(null);

  const getModelOptions = async () => {
    await getModelOptionsList(selectedProject.id, true).then((response) => {
      setModelOptions(response.data.data);
    });
  };

  const getNode = async () => {
    await getNodeList().then((response) => {
      setNodeList(response.data.data);
    });
  };

  const addSimulation = () => {
    setSimulation([
      ...simulation,
      {
        modelId: null,
        nodeId: null,
        experiment: null,
        finalStep: 0,
        waiting: true,
        status: 0,
        currentStep: 0,
        progress: 0,
        resultId: null,
      },
    ]);
  };

  const removeSimulation = (e) => {
    const removeIndex = parseInt(e.currentTarget.value);
    setSimulation(simulation.filter((_, index) => index !== removeIndex));
    setSelectedSimulation(
      selectedSimulation.filter((_, i) => i !== removeIndex)
    );
  };

  const runSimulationEvent = async () => {
    console.log(selectedSimulation);
  };

  const selectSimulation = (e) => {
    const checked = e.currentTarget.checked;
    const index = parseInt(e.currentTarget.value);

    if (checked) {
      const simulationSelected = JSON.parse(e.currentTarget.name);
      setSelectedSimulation([...selectedSimulation, simulationSelected]);
    } else {
      setSelectedSimulation(selectedSimulation.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    getModelOptions();
    getNode();
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen justify-between">
        {selectedProject && (
          <>
            <div className="p-4 sm:ml-64">
              <h1 className="text-4xl font-semibold">{selectedProject.name}</h1>
            </div>
            <div className="px-4 pb-4 overflow-y-auto flex-grow sm:ml-64">
              {simulation.map((s, index) => {
                return (
                  <Simulation
                    key={index}
                    index={index}
                    selectedProject={selectedProject}
                    nodeOptions={nodeList}
                    modelOptions={modelOptions}
                    selectSimulation={selectSimulation}
                    removeSimulation={removeSimulation}
                  />
                );
              })}
              <AddSimulation onClick={addSimulation} />
            </div>
          </>
        )}
        <div className="p-4 w-screen border">
          <footer className="static block p-4 sm:ml-64 bottom-0 text-black border-t border border-gray-200 rounded-lg shadow">
            <div className="flex justify-between items-center">
              {status !== 3 && (
                <>
                  <span>
                    {selectedSimulation.length > 0 && (
                      <span class="bg-indigo-100 text-indigo-800 text-xl font-medium px-2.5 py-0.5 rounded">
                        {selectedSimulation.length}{" "}
                        {selectedSimulation.length > 1
                          ? "simulations"
                          : "simulation"}{" "}
                        selected
                      </span>
                    )}
                  </span>
                  <button
                    className="text-white gap-4 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
                    disabled={selectedSimulation.length === 0}
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
                </>
              )}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Project;
