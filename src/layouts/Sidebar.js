import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";

function Sidebar({ modelList }) {
  useEffect(() => {}, [modelList]);

  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-50 transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex px-3 py-4 items-center gap-2 justify-center text-center">
        <img src="/favicon.ico" className="size-10" alt="logo" />
        <h1 className="font-semibold text-lg">Pig Farm Simulation</h1>
      </div>
      <div className="flex items-center ml-4 p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
        <FolderIcon className="flex-shrink-0 size-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
        <span className="ms-3 font-medium">Project</span>
      </div>
      <div className="h-full overflow-y-auto">
        <ul className="ml-12">
          {Array.from(modelList).map((model, index) => {
            return (
              <li key={model.id}>
                <div className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                  <DocumentIcon className="flex-shrink-0 size-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                  <span className="ms-3">{model.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
