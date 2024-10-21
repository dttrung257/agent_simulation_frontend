import { DocumentIcon } from "@heroicons/react/24/solid";
import { useEffect } from "react";

function Sidebar({
  projectList,
  selectedProject,
  onSelectedProject,
  modelList,
}) {
  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-50 transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="flex px-3 py-4 items-center gap-2 justify-center text-center">
        <img src="/favicon.ico" className="size-10" alt="logo" />
        <h1 className="font-semibold text-lg">Pig Farm Simulation</h1>
      </div>
      <div className="mx-4 mb-2 text-lg font-semibold">Projects</div>
      <div className="h-full overflow-y-auto">
        <ul className="mx-4 font-medium">
          {Array.from(projectList).map((project, index) => {
            return (
              <>
                <li
                  className="flex cursor-pointer items-center p-2 gap-4 text-gray-900 rounded-lg hover:bg-gray-100 group"
                  onClick={onSelectedProject}
                  id={index}
                  value={project.id}
                  key={project.id}
                >
                  <DocumentIcon className="flex-shrink-0 size-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                  {project.name}
                  {selectedProject.id === project.id && (
                    <span className="flex w-3 h-3 bg-pink-200 rounded-full"></span>
                  )}
                </li>
                {selectedProject.id === project.id && (
                  <>
                    <ul className="ml-9 mr-4 h-72 overflow-auto font-medium">
                      {modelList.map((model, index) => {
                        return (
                          <li
                            className="flex items-center p-2 gap-4 text-gray-900"
                            id={index}
                            value={model.id}
                            key={index}
                          >
                            {model.name}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
