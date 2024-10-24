import AddSimulation from "../components/AddSimulation";
import Alert from "../layouts/Alert";
import Simulation from "../components/Simulation";
import { useEffect, useState } from "react";
import {
  getModelOptionsList,
  getNodeList,
  runSimulation,
} from "../api/simulationApi";

function Project({ selectedProject }) {
  const [nodeList, setNodeList] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [simulation, setSimulation] = useState([]);
  const [error, setError] = useState(false);
  const [order, setOrder] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [disableSimulation, setDisableSimulation] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);

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
        order: order,
        modelId: null,
        nodeId: null,
        finalStep: 0,
        status: 0,
        resultId: null,
        finished: false,
      },
    ]);
    setOrder(order + 1);
  };

  const removeSimulation = (e) => {
    const removeIndex = parseInt(e.currentTarget.value);
    setSimulationStatus(null);
    setSimulation(simulation.filter((_, index) => index !== removeIndex));
  };

  const runSimulationEvent = async () => {
    const simulationRequests = [];
    simulation.forEach((s) => {
      simulationRequests.push({
        order: s.order,
        nodeId: s.nodeId,
        projectId: selectedProject.id,
        experiments: [
          { id: s.experimentId, modelId: s.modelId, finalStep: s.finalStep },
        ],
      });
    });

    setDisableSimulation(true);
    setIsSimulationRunning(true);
    await runSimulation(simulationRequests)
      .then((response) => {
        setSimulationStatus("Success! Simulation is running.");
        setError(false);
        response.data.data.forEach((result) => {
          const copiedSimulation = [...simulation];
          console.log(copiedSimulation);
          const updatedSimulation = copiedSimulation.find(
            (s) => s.order === result.order
          );
          updatedSimulation.status = 1;
          updatedSimulation.resultId = result.experimentResultId;
          setSimulation(copiedSimulation);
        });
        setIsSimulationRunning(true);
        setSimulationStatus("Success! Simulation is running.");
      })
      .catch((e) => {
        setError(true);
        setIsSimulationRunning(false);
        setDisableSimulation(false);
        setSimulationStatus(e.response.data.message);
      });
  };

  const updateSimulation = (updatedSimulation, index) => {
    console.log(updatedSimulation);
    if (!isSimulationRunning) {
      setSimulationStatus(null);
      setError(false);
      setSimulationStatus(null);
    }
    const updatedSimulationRequest = simulation.map((s, i) => {
      if (i === index) {
        return updatedSimulation;
      }
      return s;
    });
    setSimulation(updatedSimulationRequest);
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
                    simulation={s}
                    nodeOptions={nodeList}
                    modelOptions={modelOptions}
                    removeSimulation={removeSimulation}
                    isSimulationRunning={isSimulationRunning}
                    updateSimulation={updateSimulation}
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
              <div>
                {!isSimulationRunning && simulationStatus === null && (
                  <span>
                    {simulation.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-800 text-xl font-medium px-2.5 py-0.5 rounded">
                        {simulation.length}{" "}
                        {simulation.length > 1 ? "simulations" : "simulation"}
                      </span>
                    )}
                  </span>
                )}

                {isSimulationRunning && !error && (
                  <Alert type="success" message={simulationStatus} />
                )}

                {error && <Alert type="error" message={simulationStatus} />}
              </div>
              <button
                className="text-white gap-4 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
                disabled={simulation.length === 0 || disableSimulation}
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
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Project;
