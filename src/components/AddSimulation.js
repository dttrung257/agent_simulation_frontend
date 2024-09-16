import { PlusCircleIcon } from "@heroicons/react/24/solid";

function AddSimulation() {
  return (
    <div className="p-4 mt-4 text-slate-500 flex rounded-lg border border-gray-200 bg-white shadow-md hover:cursor-pointer">
      <div className="p-4 gap-2 w-full justify-center flex rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 hover:text-slate-600 hover:border-gray-400">
        <PlusCircleIcon className="size-6" />
        Add Simulation
      </div>
    </div>
  );
}

export default AddSimulation;
