import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getSimulationResults,
  getDownloadSimulationResultURL,
  deleteSimulation,
} from "../api/simulationApi";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import Alert from "../layouts/Alert";

const FRAME_RATE = 45;

const SimulationResults = () => {
  const { projectId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState({});
  const [deleteStatus, setDeleteStatus] = useState({});

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatTime = (steps) => {
    // Convert steps to seconds
    const totalSeconds = Math.floor((steps * 60) / FRAME_RATE);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const remainingSeconds = totalSeconds % (24 * 60 * 60);
    const hours = Math.floor(remainingSeconds / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = remainingSeconds % 60;

    if (days > 0) {
      return `${days} days, ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const fetchResults = async () => {
    try {
      const response = await getSimulationResults(projectId);
      setResults(response.data.data);
    } catch (error) {
      console.error("Error fetching simulation results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [projectId]);

  const handleDelete = async (simulationId) => {
    if (!window.confirm("Are you sure you want to delete this simulation?")) {
      return;
    }

    try {
      setDeleteStatus((prev) => ({ ...prev, [simulationId]: "loading" }));
      await deleteSimulation(simulationId);
      setDeleteStatus((prev) => ({ ...prev, [simulationId]: "success" }));
      await fetchResults();
      setTimeout(() => {
        setDeleteStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[simulationId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error("Error deleting simulation:", error);
      setDeleteStatus((prev) => ({ ...prev, [simulationId]: "error" }));
      setTimeout(() => {
        setDeleteStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[simulationId];
          return newStatus;
        });
      }, 3000);
    }
  };

  const handleDownload = async (resultId) => {
    try {
      setDownloadStatus((prev) => ({ ...prev, [resultId]: "loading" }));
      const response = await getDownloadSimulationResultURL(resultId);
      const downloadUrl = response.data.data.downloadUrl;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStatus((prev) => ({ ...prev, [resultId]: "success" }));
      setTimeout(() => {
        setDownloadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[resultId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error("Error downloading result:", error);
      setDownloadStatus((prev) => ({ ...prev, [resultId]: "error" }));
      setTimeout(() => {
        setDownloadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[resultId];
          return newStatus;
        });
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Simulation Results
      </h2>

      <div className="space-y-6">
        {results.map((simulation) => (
          <div key={simulation.id} className="border rounded-lg p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-700">
                  {formatDate(simulation.createdAt)}
                </h3>
              </div>
              <button
                onClick={() => handleDelete(simulation.id)}
                disabled={deleteStatus[simulation.id] === "loading"}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:z-10 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {deleteStatus[simulation.id] === "loading" ? (
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <TrashIcon className="w-4 h-4 mr-2" />
                )}
                Delete
              </button>
            </div>

            {deleteStatus[simulation.id] === "error" && (
              <div className="mb-4">
                <Alert
                  type="error"
                  message="Failed to delete simulation. Please try again."
                />
              </div>
            )}

            <div className="grid gap-4">
              {simulation.details.map((detail) => (
                <div
                  key={detail.experimentResultId}
                  className="bg-white p-4 rounded-lg border shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {detail.experimentName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Model: {detail.modelName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Final Step: {detail.finalStep - 1}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Time:{" "}
                        {formatTime((detail.finalStep - 1) * FRAME_RATE)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/result/${detail.experimentResultId}/view-steps?finalStep=${detail.finalStep}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700"
                      >
                        <EyeIcon className="w-4 h-4 mr-2" />
                        View Result
                      </Link>

                      <button
                        onClick={() =>
                          handleDownload(detail.experimentResultId)
                        }
                        disabled={
                          downloadStatus[detail.experimentResultId] ===
                          "loading"
                        }
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadStatus[detail.experimentResultId] ===
                        "loading" ? (
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        ) : (
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        )}
                        Download
                      </button>
                    </div>
                  </div>

                  {downloadStatus[detail.experimentResultId] === "error" && (
                    <div className="mt-2">
                      <Alert
                        type="error"
                        message="Failed to download. Please try again."
                      />
                    </div>
                  )}

                  {downloadStatus[detail.experimentResultId] === "success" && (
                    <div className="mt-2">
                      <Alert
                        type="success"
                        message="Download started successfully!"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                to={`/result/${simulation.resultIds}/view-results`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
              >
                View All Results
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationResults;
