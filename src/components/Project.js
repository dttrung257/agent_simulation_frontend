import AddSimulation from "./AddSimulation";
import Alert from "../layouts/Alert";
import Simulation from "./Simulation";
import { useEffect, useState } from "react";
import {
  getModelOptionsList,
  getNodeList,
  runSimulation,
} from "../api/simulationApi";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

function Project({ selectedProject }) {
  const [nodeList, setNodeList] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [order, setOrder] = useState(1);
  const [simulation, setSimulation] = useState([]);
  const [error, setError] = useState(false);
  const [checkFinish, setCheckFinish] = useState(0);
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
        waiting: true,
        status: 0,
        currentStep: 0,
        progress: 0,
        resultId: null,
      },
    ]);
    setOrder(order + 1);
  };

  const removeSimulation = (orderToRemove) => {
    setSimulationStatus(null);
    setSimulation(simulation.filter((s) => s.order !== orderToRemove));
  };

  const runSimulationEvent = async () => {
    const simulationRequests = [];
    simulation.forEach((s) => {
      simulationRequests.push({
        order: s.order,
        nodeId: s.nodeId,
        projectId: selectedProject.id,
        experiments: [
          {
            id: s.experimentId,
            modelId: s.modelId,
            finalStep: s.finalStep + 1,
          },
        ],
      });
    });

    setDisableSimulation(true);

    await runSimulation(simulationRequests)
      .then((response) => {
        setSimulationStatus("Success! Simulation is running.");
        setError(false);
        response.data.data.forEach((result) => {
          const copiedSimulation = [...simulation];
          const updatedSimulation = copiedSimulation.find(
            (s) => s.order === result.order
          );
          updatedSimulation.resultId = result.experimentResultId;
          console.log(result.order, result.experimentResultId);
          updatedSimulation.status = 1;
          setSimulation(copiedSimulation);
        });
        setIsSimulationRunning(true);
        setSimulationStatus("Success! Simulation is running.");
      })
      .catch((e) => {
        console.log(e);
        setError(true);
        setIsSimulationRunning(false);
        setDisableSimulation(false);
        setSimulationStatus(e.response.data.message);
      });
  };

  const newRun = () => {
    window.location.reload();
  };

  const updateSimulation = (updatedSimulation, orderUpdate) => {
    setSimulationStatus(null);
    setError(false);
    setSimulationStatus(null);
    const updatedSimulationRequest = simulation.map((s) => {
      if (s.order === orderUpdate) {
        return updatedSimulation;
      }
      return s;
    });
    setSimulation(updatedSimulationRequest);
  };

  const checkSimulationFinish = () => {
    setCheckFinish(checkFinish + 1);
  };

  const refreshSimulation = () => {
    setSimulationStatus(null);
    setError(false);
    setSimulationStatus(null);
    setSimulation([]);
    setOrder(1);
    setIsSimulationRunning(false);
    setDisableSimulation(false);
    setCheckFinish(0);
  };

  useEffect(() => {
    getModelOptions();
    getNode();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      refreshSimulation();
      getModelOptions();
      getNode();
    }
  }, [selectedProject?.id]);

  return (
    <>
      <div className="flex flex-col h-screen justify-between">
        {selectedProject && (
          <>
            <div className="p-4 sm:ml-64">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                    {selectedProject.name}
                  </h1> */}
                  <div className="relative inline-flex items-center gap-2 text-sm p-0.5 overflow-hidden text-gray-900 rounded-full group bg-gradient-to-br from-green-400 to-blue-600">
                    <span className="relative flex items-center gap-2 px-3 py-1.5 bg-white rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span className="font-medium text-gray-700">
                        45 minutes/step
                      </span>
                    </span>
                  </div>
                </div>

                {!isSimulationRunning && (
                  <button
                    type="button"
                    onClick={() => refreshSimulation()}
                    className="relative inline-flex items-center justify-center gap-1.5 text-sm p-0.5 overflow-hidden text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white focus:ring-4 focus:ring-green-200 font-medium"
                  >
                    <span className="relative flex items-center gap-1.5 px-3 py-1.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                      <ArrowPathIcon className="size-4" />
                      Reset
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 pb-4 overflow-y-auto flex-grow sm:ml-64">
              {simulation.map((s, index) => {
                return (
                  <Simulation
                    key={s.order}
                    index={index}
                    selectedProject={selectedProject}
                    simulation={s}
                    nodeOptions={nodeList}
                    modelOptions={modelOptions}
                    removeSimulation={removeSimulation}
                    isSimulationRunning={isSimulationRunning}
                    updateSimulation={updateSimulation}
                    checkSimulationFinish={checkSimulationFinish}
                  />
                );
              })}
              {!isSimulationRunning && (
                <AddSimulation onClick={addSimulation} />
              )}
            </div>
          </>
        )}

        {isSimulationRunning && checkFinish === simulation.length && (
          <div className="flex justify-end mb-4 mr-8">
            <Link
              to={`/result/${simulation
                .filter((s) => s.resultId)
                .map((s) => s.resultId)
                .filter((id) => id.toString().trim() !== "")
                .join(",")}/view-results`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white focus:ring-4 focus:ring-green-200">
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                  View All Results
                </span>
              </button>
            </Link>
          </div>
        )}

        <div className="p-4 w-screen border">
          <footer className="static block p-4 sm:ml-64 bottom-0 text-black border-t border border-gray-200 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                {!error && (
                  <span>
                    {simulation.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-800 text-xl font-medium px-2.5 py-0.5 rounded">
                        {simulation.length}{" "}
                        {simulation.length > 1 ? "simulations" : "simulation"}
                      </span>
                    )}
                  </span>
                )}
                {error && <Alert type="error" message={simulationStatus} />}
              </div>
              {isSimulationRunning && checkFinish === simulation.length && (
                <button
                  className="text-white gap-4 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
                  onClick={() => newRun()}
                >
                  New Run
                </button>
              )}
              {(!isSimulationRunning || checkFinish !== simulation.length) && (
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
              )}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default Project;
