import React, { useState, useEffect } from "react";
import { getNodeMetrics, getMetricValue } from "../api/simulationApi";

const NodeMetrics = ({ selectedProject }) => {
  const [metrics, setMetrics] = useState([]);
  const [error, setError] = useState(null);

  const formatMemory = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const fetchMetrics = async () => {
    try {
      const { data } = await getNodeMetrics();
      const nodesData = await Promise.all(
        data.data.nodeMetrics.map(async (node) => {
          const cpuResponse = await getMetricValue(node.showCpuUsageEndpoint);
          const memoryResponse = await getMetricValue(
            node.showMemoryUsageEndpoint
          );

          return {
            nodeName: node.nodeName,
            cpu: (cpuResponse.data.measurements[0].value * 100).toFixed(2),
            memory: formatMemory(memoryResponse.data.measurements[0].value),
          };
        })
      );
      setMetrics(nodesData);
    } catch (err) {
      setError("Failed to fetch metrics");
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedProject?.id) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedProject]);

  if (error) return null;

  return (
    <div className="flex gap-4 mb-4">
      {metrics.map((node) => (
        <div
          key={node.nodeName}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {node.nodeName}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-600">CPU: </span>
              <span className="font-medium">{node.cpu}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600">Memory: </span>
              <span className="font-medium">{node.memory}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NodeMetrics;
