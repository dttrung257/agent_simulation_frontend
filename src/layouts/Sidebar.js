import { FolderIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

function Sidebar({
  projectList,
  selectedProject,
  onSelectedProject,
  modelList,
}) {
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    if (selectedProject.id) {
      setExpandedProject(selectedProject.id);
    }
  }, [selectedProject.id]);

  const toggleModels = (projectId, event) => {
    event.stopPropagation();
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleProjectClick = (e) => {
    onSelectedProject(e);
    const projectId = projectList[e.target.id].id;

    if (selectedProject.id === projectId) {
      setExpandedProject(expandedProject === projectId ? null : projectId);
    } else {
      setExpandedProject(projectId);
    }
  };

  const formatModelName = (name) => {
    return name.endsWith('.gaml') ? name : `${name}.gaml`;
  };

  return (
    <aside
      className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-50 transition-transform -translate-x-full sm:translate-x-0 flex-col"
      aria-label="Sidebar"
    >
      <div className="flex px-3 py-4 items-center gap-2 justify-center text-center">
        <img src="/favicon.ico" className="size-10" alt="logo" />
        <h1 className="font-semibold text-lg">Pig Farm Simulation</h1>
      </div>

      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Projects</span>
        </div>
      </div>

      <div className="h-full overflow-y-auto">
        <ul className="mx-4 font-medium space-y-2">
          {Array.from(projectList).map((project, index) => {
            const isSelected = selectedProject.id === project.id;
            const isExpanded = expandedProject === project.id;

            return (
              <div key={project.id}>
                <li
                  className={`flex cursor-pointer items-center p-2 gap-4 text-gray-900 rounded-lg ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <div 
                    className="flex-1 flex items-center gap-4"
                    onClick={handleProjectClick}
                    id={index}
                    value={project.id}
                  >
                    <FolderIcon className="flex-shrink-0 size-5 text-gray-500" />
                    {project.name}
                  </div>
                  
                  {isSelected && (
                    <ChevronDownIcon
                      className={`size-5 text-gray-500 cursor-pointer transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      onClick={(e) => toggleModels(project.id, e)}
                    />
                  )}
                </li>

                {isSelected && isExpanded && (
                  <ul className="ml-9 mr-4 mt-2 space-y-1 overflow-y-auto max-h-60 transition-all duration-200">
                    {modelList.map((model) => (
                      <li
                        key={model.id}
                        className="flex items-center p-2 text-sm text-gray-600"
                      >
                        {formatModelName(model.name)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
