import AnimationPlayer from "./pages/AnimationPlayer";
import Project from "./pages/Project";
import { Route, Routes } from "react-router-dom";
import StepViewer from "./pages/StepViewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Project />} />
      <Route path="/view-steps" element={<StepViewer />} />
      <Route path="/play-animation" element={<AnimationPlayer />} />
    </Routes>
  );
}

export default App;
