import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PerformanceMetrics = ({ data }) => {
  const FRAME_RATE = 45;

  const transformData = (nodeMetricData) => {
    let startTime = 0;
    const totalMetrics = nodeMetricData.length;

    const transformed = nodeMetricData.map((item, index) => {
      const timeInSeconds = index === 0 ? 0 : startTime + item.duration / 1000;
      startTime = timeInSeconds;

      const totalMemoryMB = 500; // Define total memory as 500MB
      return {
        ...item,
        timeInSeconds,
        cpuUsagePercent: item.cpuUsage * 100,
        memoryUsageMB: item.memoryUsage / (1024 * 1024),
        memoryUsagePercent: (item.memoryUsage / (1024 * 1024) / totalMemoryMB) * 100,
      };
    });

    const cpuAverage =
      transformed.reduce((sum, item) => sum + item.cpuUsagePercent, 0) /
      totalMetrics;
    const memoryAverage =
      transformed.reduce((sum, item) => sum + item.memoryUsageMB, 0) /
      totalMetrics;

    return { transformed, cpuAverage, memoryAverage };
  };

  const formatTimeAxis = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}s`;
  };

  const formatSimulationTime = (steps) => {
    const totalMinutes = steps - 1;
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days} days, ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const formatExecutionTime = (nanoseconds) => {
    const seconds = nanoseconds / 1_000_000_000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDisplayStep = (step) => {
    return Math.floor(step / FRAME_RATE);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium text-gray-700">
          Time: {formatTimeAxis(label)}s
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}%
          </p>
        ))}
      </div>
    );
  };

  const chartConfig = {
    margin: { top: 40, right: 30, left: 70, bottom: 30 },
    labelOffset: -55,
  };

  const getTickCount = (dataLength) => {
    if (dataLength <= 10) return dataLength;
    if (dataLength <= 50) return 10;
    if (dataLength <= 100) return 8;
    return 6;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-3xl font-semibold text-center mb-8 mt-8">
        Performance Metrics
      </h2>

      {data.nodeMetrics.map((node, nodeIndex) => {
        const nodeMemory =
          node.nodeMetricData[0]?.systemMemory / (1024 * 1024 * 1024);
        const { transformed, cpuAverage, memoryAverage } = transformData(
          node.nodeMetricData
        );

        const tickCount = getTickCount(transformed.length);

        return (
          <div key={nodeIndex} className="space-y-8 mt-12">
            <h3 className="text-xl font-medium">Node {node.nodeName}</h3>

            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.experimentResultMetrics
                  .filter((result) => result.nodeId === node.nodeId)
                  .map((result, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <div className="mb-2 text-lg font-medium text-center">
                        Simulation {index + 1}
                      </div>
                      <div className="text-base space-y-2">
                        <div>Experiment: {result.experimentName}</div>
                        <div>Model: {result.modelName}</div>
                        <div>Frame Rate: {FRAME_RATE}</div>
                        <div className="text-blue-600 font-medium">
                          Simulation Time:{" "}
                          {formatSimulationTime(result.finalStep)}
                        </div>
                        <div className="text-green-600 font-medium">
                          Execution Time: {formatExecutionTime(result.runTime)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-start mb-4 gap-20">
              <div>
                <h4 className="text-lg font-medium text-gray-600">
                  Total Simulations:
                </h4>
                <p className="text-xl font-semibold text-purple-600">
                  {
                    data.experimentResultMetrics.filter(
                      (result) => result.nodeId === node.nodeId
                    ).length
                  }
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-600">
                  Average CPU Usage:
                </h4>
                <p className="text-xl font-semibold text-blue-600">
                  {cpuAverage.toFixed(2)}%
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-600">
                  Average Memory Usage:
                </h4>
                <p className="text-xl font-semibold text-red-600">
                  {memoryAverage.toFixed(2)} MB / {nodeMemory.toFixed(2)} GB
                </p>
              </div>
            </div>

            {/* CPU Chart */}
            <div className="border rounded-lg p-6">
              <h1 className="text-xl font-medium mb-4">CPU Usage (%)</h1>
              <div className="h-[1000px]">
                <ResponsiveContainer>
                  <AreaChart data={transformed} margin={chartConfig.margin}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="timeInSeconds"
                      tickFormatter={formatTimeAxis}
                      tickMargin={15}
                      //   interval="preserveStartEnd"
                      //   tickCount={tickCount}
                      interval={Math.ceil(transformed.length / 12)}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={28}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tickMargin={20}
                      fontSize={28}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{
                        fontSize: '24px',
                        paddingTop: '0px'
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="cpuGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4A90E2"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4A90E2"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="linear"
                      dataKey="cpuUsagePercent"
                      name="CPU Usage"
                      stroke="#4A90E2"
                      fill="url(#cpuGradient)"
                      strokeWidth={2}
                      label={
                        transformed.length <= 20
                          ? {
                              position: "top",
                              dy: -10, // Moving label much higher up to avoid overlap
                              dx: 0,   // Centering horizontally
                              fill: "#4A90E2",
                              fontSize: 23,
                              formatter: (value) => `${value.toFixed(1)}%`,
                            }
                          : false
                      }
                      dot={
                        transformed.length <= 20
                          ? { r: 4, fill: "#4A90E2" }
                          : false
                      }
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory Chart */}
            <div className="border rounded-lg p-6">
              <h1 className="text-xl font-medium mb-4">Memory Usage (MB)</h1>
              <div className="h-[1000px]">
                <ResponsiveContainer>
                  <AreaChart data={transformed} margin={chartConfig.margin}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="timeInSeconds"
                      tickFormatter={formatTimeAxis}
                      tickMargin={15}
                      //   interval="preserveStartEnd"
                      //   tickCount={tickCount}
                      interval={Math.ceil(transformed.length / 12)}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={28}
                    />
                    <YAxis
                      domain={[0, 500]} // Set domain to 0-500MB
                      tickFormatter={(value) => `${value} MB`}
                      tickMargin={20}
                      fontSize={28}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{
                        fontSize: '24px',
                        paddingTop: '0px'
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="memoryGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FFE5B4"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FFE5B4"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="linear"
                      dataKey="memoryUsageMB"
                      name="Memory Usage"
                      stroke="#FF6B6B"
                      fill="url(#memoryGradient)"
                      strokeWidth={2}
                      label={false}
                      dot={
                        transformed.length <= 20
                          ? { r: 4, fill: "#FF6B6B" }
                          : false
                      }
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PerformanceMetrics;