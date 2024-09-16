import Project from "./pages/Project";
import SimulationResult from "./pages/SimulationResult";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Project />} />
      <Route path="/result" element={<SimulationResult />} />
    </Routes>
  );
}

export default App;
