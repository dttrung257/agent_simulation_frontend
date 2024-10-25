import AnimationPlayer from "./pages/AnimationPlayer";
import MainPage from "./pages/MainPage";
import { Route, Routes } from "react-router-dom";
import StepViewer from "./pages/StepViewer";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/result/:resultId/view-steps" element={<StepViewer />} />
      <Route
        path="/result/:resultId/play-animation"
        element={<AnimationPlayer />}
      />
    </Routes>
  );
}

export default App;
