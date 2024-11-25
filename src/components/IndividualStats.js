import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const IndividualStats = ({ data, selectedPig, setSelectedPig }) => {
  const CustomizedAxisLabel = ({ viewBox, value, offset = 0 }) => {
    const { x, y, width, height } = viewBox;
    return (
      <text
        x={x + width / 2}
        y={y + height + offset}
        fill="#666"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm"
      >
        {value}
      </text>
    );
  };

  const ChartContainer = ({ title, children }) => (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-[400px]">{children}</div>
    </div>
  );

  const getSEIRStatusColor = (seir) => {
    switch (seir) {
      case 0:
        return "bg-green-100 text-green-800";
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-red-100 text-red-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      case 4:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSEIRStatusText = (seir) => {
    switch (seir) {
      case 0:
        return "Unexposed";
      case 1:
        return "Exposed";
      case 2:
        return "Infected";
      case 3:
        return "Recovered";
      case 4:
        return "Dead";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-8">
      {/* Pig Selector */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Pig</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {data.pigpenData.map((pen) =>
            pen.pigData.map((pig) => (
              <button
                key={pig.pigId}
                onClick={() => setSelectedPig(pig)}
                className={`
                  p-3 rounded-lg transition-all duration-200 text-sm
                  ${
                    selectedPig?.pigId === pig.pigId
                      ? "bg-blue-600 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <div className="font-medium">Pig {pig.pigId}</div>
                <div className="text-xs mt-1 opacity-80">
                  Pen {pen.pigpenId}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {selectedPig && (
        <div className="space-y-8">
          {/* SEIR Status Timeline */}
          {selectedPig.pigDaily.some((day) => day.seir !== undefined) && (
            <ChartContainer title="Health Status Timeline">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
                {selectedPig.pigDaily.map((day) => (
                  <div
                    key={day.day}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-700">
                      Day {day.day}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${getSEIRStatusColor(
                        day.seir
                      )}`}
                    >
                      {getSEIRStatusText(day.seir)}
                    </span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          )}

          {/* Weight Chart */}
          <ChartContainer title="Weight Growth">
            <ResponsiveContainer>
              <LineChart
                data={selectedPig.pigDaily}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{
                    value: "Weight (kg)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)} kg`]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* DFI vs Target DFI Chart */}
          <ChartContainer title="Daily Feed Intake (DFI) vs Target">
            <ResponsiveContainer>
              <LineChart
                data={selectedPig.pigDaily}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{
                    value: "DFI (kg/day)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)} kg/day`]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="dfi"
                  name="Actual DFI"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetDfi"
                  name="Target DFI"
                  stroke="#ff7300"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* CFI vs Target CFI Chart */}
          <ChartContainer title="Cumulative Feed Intake (CFI) vs Target">
            <ResponsiveContainer>
              <LineChart
                data={selectedPig.pigDaily}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{
                    value: "CFI (kg)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)} kg`]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="cfi"
                  name="Actual CFI"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetCfi"
                  name="Target CFI"
                  stroke="#ff7300"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Eating Events Chart */}
          <ChartContainer title="Eating Events">
            <ResponsiveContainer>
              <BarChart
                data={selectedPig.pigDaily}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                />
                <YAxis
                  label={{
                    value: "Count",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [value, "Events"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="eatCount"
                  name="Eating Events"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Excretion Events Chart */}
          <ChartContainer title="Excretion Events">
            <ResponsiveContainer>
              <BarChart
                data={selectedPig.pigDaily}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                />
                <YAxis
                  label={{
                    value: "Count",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [value, "Events"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="excreteCount"
                  name="Excretion Events"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default IndividualStats;
