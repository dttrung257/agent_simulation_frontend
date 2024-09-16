import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getExperimentResult,
  getExperimentResultImages,
} from "../api/simulationApi";
import Carousel from "../components/Carousel";

function SimulationResult() {
  const data = useLocation();
  const [experimentResultId, setExperimentResultId] = useState(-1);
  const [cfi, setCfi] = useState([]);
  const [cfiPig, setCfiPig] = useState([]);
  const [simulator, setSimulator] = useState([]);
  const [weight, setWeight] = useState([]);
  const [dfi, setDfi] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("cfi");

  const simulation = data.state.simulation;

  const splitResultImageArray = (result) => {
    const chunkSize = simulation.finalStep;
    const numberOfChunks = 5;

    return [...Array(numberOfChunks)].map((value, index) => {
      return result.slice(index * chunkSize, (index + 1) * chunkSize);
    });
  };

  useEffect(() => {
    getExperimentResult(
      process.env.REACT_APP_PROJECT_ID,
      simulation.model,
      simulation.experiment
    )
      .then((response) => {
        setExperimentResultId(response.data.data[0].id);
        console.log(response.data.data[0].id);
      })
      .catch((error) => {
        console.log(error);
      });

    getExperimentResultImages(
      process.env.REACT_APP_PROJECT_ID,
      simulation.model,
      simulation.experiment,
      experimentResultId
    ).then((response) => {
      const arraySplit = splitResultImageArray(response.data.data);
      setCfi(arraySplit[0]);
      setCfiPig(arraySplit[1]);
      setDfi(arraySplit[2]);
      setSimulator(arraySplit[3]);
      setWeight(arraySplit[4]);
    });
  }, [experimentResultId]);

  const onClick = (e) => {
    setCurrentCategory(e.target.name);
  };

  return (
    <div className="w-full h-full place-content-center">
      <div className="grid grid-cols-3 my-12">
        <span></span>
        <span className="p-4">
          <button
            name="cfi"
            onClick={(e) => onClick(e)}
            className="px-4 py-2 text-lg font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            CFI
          </button>
          <button
            name="cfiPig"
            onClick={(e) => onClick(e)}
            className="px-4 py-2 text-lg font-medium bg-white border-t border-b border-r border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            CFI Pig
          </button>
          <button
            name="dfi"
            onClick={(e) => onClick(e)}
            className="px-4 py-2 text-lg font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            DFI
          </button>
          <button
            name="simulator"
            onClick={(e) => onClick(e)}
            className="px-4 py-2 text-lg font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            Simulator
          </button>
          <button
            name="weight"
            onClick={(e) => onClick(e)}
            className="px-4 py-2 text-lg font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
          >
            Weight
          </button>
        </span>
        <span></span>
      </div>
      <div className="w-[36%] m-auto">
        {currentCategory === "cfi" && <Carousel slides={cfi} />}
        {currentCategory === "cfiPig" && <Carousel slides={cfiPig} />}
        {currentCategory === "dfi" && <Carousel slides={dfi} />}
        {currentCategory === "simulator" && <Carousel slides={simulator} />}
        {currentCategory === "weight" && <Carousel slides={weight} />}
      </div>
    </div>
  );
}

export default SimulationResult;
