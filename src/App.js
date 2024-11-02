import AnimationPlayer from "./pages/AnimationPlayer";
import MainPage from "./pages/MainPage";
import { Route, Routes } from "react-router-dom";
import ResultViewer from "./pages/ResultViewer";
import AllResultViewer from "./pages/AllResultViewer";

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
    </Routes>
  );
}

export default App;
