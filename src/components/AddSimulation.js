import { PlusCircleIcon } from "@heroicons/react/24/solid";

function AddSimulation() {
  return (
    <div className="p-4 mt-4 text-slate-500 flex rounded-lg border border-gray-200 bg-white shadow-md hover:bg-gray-50 hover:text-slate-600 hover:cursor-pointer">
      <div className="p-4 w-full justify-center flex rounded-lg border-dashed border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400">
        <PlusCircleIcon className="size-6" />
      </div>
    </div>
  );
}

export default AddSimulation;
