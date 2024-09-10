import Sidebar from "./Sidebar";
import Simulation from "./Simulation";

function Project() {
  const workerNodeOptions = ["Master node", "Worker node 1", "Worker node 2"];

  const modelOptions = ["Model 1", "Model 2", "Model 3"];

  return (
    <div>
      <Sidebar modelList={modelOptions} />
      <div className="p-4 sm:ml-64">
        <h1 className="text-4xl font-semibold mb-4">Project</h1>
        <Simulation
          nodeOptions={workerNodeOptions}
          modelOptions={modelOptions}
        />
      </div>
    </div>
  );
}

export default Project;
