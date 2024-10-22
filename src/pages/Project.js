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
  const [order, setOrder] = useState(1);
  const [simulation, setSimulation] = useState([]);
  const [experimentOptions, setExperimentOptions] = useState([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState("");
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
        order: order,
        model: null,
        node: null,
        experiment: null,
        resultId: null,
        waiting: true,
        status: 0,
        currentStep: 0,
        progress: 0,
      },
    ]);
    setOrder(order + 1);
  };

  const runSimulationEvent = async () => {};

  const onSelectOption = (index, name, value) => {};

  const selectSimulation = (e) => {
    console.log(e.target.name.order);
  };

  useEffect(() => {
    getModelOptions();
    getNode();
  }, []);

  return (
    <div className="h-screen w-screen">
      {selectedProject && (
        <div className="p-4 sm:ml-64">
          <h1 className="text-4xl font-semibold mb-4">
            {selectedProject.name}
          </h1>
          {simulation.map((s, index) => {
            console.log(s);
            return (
              <Simulation
                key={index}
                index={index}
                selectedProject={selectedProject}
                nodeOptions={nodeList}
                modelOptions={modelOptions}
                simulation={s}
                onSelectOption={onSelectOption}
                selectSimulation={selectSimulation}
              />
            );
          })}
          <div className="block mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow">
            {!waiting && (
              <div className="w-full">
                <div className="text-right font-medium text-lg mb-2">
                  {currentStep}/{simulation.finalStep}{" "}
                  {simulation.finalStep >= 2 ? "steps" : "step"}
                </div>
                <div className="w-full mb-4 bg-gray-200 rounded-full h-2">
                  <div
                    style={{ width: `${progress}%` }}
                    className="bg-blue-600 h-2 rounded-full "
                  ></div>
                </div>
              </div>
            )}

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
                {!waiting && status === 3 && (
                  <>
                    <Link
                      to={{
                        pathname: "/view-steps",
                      }}
                      state={simulation}
                    >
                      <button className="flex hover:cursor-pointer items-center justify-center p-0.5 me-2 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200">
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                          View step-by-step
                        </span>
                      </button>
                    </Link>
                    <Link
                      to={{
                        pathname: "/play-animation",
                      }}
                      state={simulation}
                    >
                      <button className="flex hover:cursor-pointer items-center justify-center p-0.5 me-2 overflow-hidden text-md font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white focus:ring-4 focus:outline-none focus:ring-pink-200">
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-opacity-0">
                          Play simulation
                        </span>
                      </button>
                    </Link>
                  </>
                )}

                {status !== 3 && (
                  <button
                    className="text-white gap-4 flex disabled:bg-blue-400 disabled:cursor-not-allowed items-center hover:cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5"
                    disabled={disableSimulation}
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
            </div>
          </div>
          <AddSimulation onClick={addSimulation} />
        </div>
      )}
    </div>
  );
}

export default Project;
