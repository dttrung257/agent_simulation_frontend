import AnimationPlayer from "./pages/AnimationPlayer";
import MainPage from "./pages/MainPage";
import { Route, Routes } from "react-router-dom";
import ResultViewer from "./pages/ResultViewer";
import AllResultViewer from "./pages/AllResultViewer";
import SimulationResults from "./components/SimulationResults";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/result/:resultId/view-steps" element={<ResultViewer />} />
      <Route path="/result/play-animation" element={<AnimationPlayer />} />
      <Route
        path="/result/:resultIds/view-results"
        element={<AllResultViewer />}
      />
      <Route
        path="/simulation-results/:projectId"
        element={<SimulationResults />}
      />
    </Routes>
  );
}

export default App;
