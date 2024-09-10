import { DocumentIcon, FolderIcon } from "@heroicons/react/24/solid";

function Sidebar({ modelList }) {
  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <ul className="space-y-2 font-medium">
          <li>
            <div className="flex items-center gap-2 justify-center text-center mb-5">
              <img src="/favicon.ico" className="size-10" alt="logo" />
              <h1 className="font-semibold text-lg">Pig Farm Simulation</h1>
            </div>
          </li>
          <li>
            <div className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <FolderIcon className="flex-shrink-0 size-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ms-3">Project</span>
            </div>
            <ul className="ml-7">
              {Array.from(modelList).map((model, index) => {
                return (
                  <li key={index}>
                    <div className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                      <DocumentIcon className="flex-shrink-0 size-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                      <span className="ms-3">{model}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
