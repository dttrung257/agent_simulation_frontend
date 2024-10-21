import AnimationPlayer from "./pages/AnimationPlayer";
import MainPage from "./pages/MainPage";
import { Route, Routes } from "react-router-dom";
import StepViewer from "./pages/StepViewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/view-steps" element={<StepViewer />} />
      <Route path="/play-animation" element={<AnimationPlayer />} />
    </Routes>
  );
}

export default App;
