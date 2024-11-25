import React, { useState } from "react";
import OverviewStats from "./OverviewStats";
import PigpenStats from "./PigpenStats";
import IndividualStats from "./IndividualStats";

// Main component for statistics
const StatisticsView = ({ data }) => {
  const [viewMode, setViewMode] = useState("overview");
  const [selectedPigpen, setSelectedPigpen] = useState(null);
  const [selectedPig, setSelectedPig] = useState(null);

  const ViewControls = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => {
          setViewMode("overview");
          setSelectedPigpen(null);
          setSelectedPig(null);
        }}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === "overview"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Overview
      </button>
      <button
        onClick={() => {
          setViewMode("pigpen");
          setSelectedPig(null);
        }}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === "pigpen"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Pigpen View
      </button>
      <button
        onClick={() => setViewMode("individual")}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === "individual"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        Individual Pig
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Statistics</h2>
      <ViewControls />

      {viewMode === "overview" && <OverviewStats data={data} />}

      {viewMode === "pigpen" && (
        <PigpenStats
          data={data}
          selectedPigpen={selectedPigpen}
          setSelectedPigpen={setSelectedPigpen}
        />
      )}

      {viewMode === "individual" && (
        <IndividualStats
          data={data}
          selectedPig={selectedPig}
          setSelectedPig={setSelectedPig}
        />
      )}
    </div>
  );
};

export default StatisticsView;
