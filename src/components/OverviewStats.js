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
} from "recharts";

const OverviewStats = ({ data }) => {
  const prepareChartData = () => {
    const weightsByDay = new Map();

    data.pigpenData.forEach((pen) => {
      pen.pigData.forEach((pig) => {
        pig.pigDaily.forEach((daily) => {
          if (!weightsByDay.has(daily.day)) {
            weightsByDay.set(daily.day, {
              day: daily.day,
              weights: new Map(),
              dfi: new Map(),
              cfi: new Map(),
            });
          }

          const dayData = weightsByDay.get(daily.day);
          const currentWeight = dayData.weights.get(pen.pigpenId) || 0;
          const currentDFI = dayData.dfi.get(pen.pigpenId) || 0;
          const currentCFI = dayData.cfi.get(pen.pigpenId) || 0;

          dayData.weights.set(pen.pigpenId, currentWeight + daily.weight);
          dayData.dfi.set(pen.pigpenId, currentDFI + daily.dfi);
          dayData.cfi.set(pen.pigpenId, currentCFI + daily.cfi);
        });
      });
    });

    return Array.from(weightsByDay.values())
      .map((dayData) => {
        const result = { day: dayData.day };
        dayData.weights.forEach((weight, pigpenId) => {
          result[`weight_${pigpenId}`] = weight;
          result[`dfi_${pigpenId}`] = dayData.dfi.get(pigpenId);
          result[`cfi_${pigpenId}`] = dayData.cfi.get(pigpenId);
        });
        return result;
      })
      .sort((a, b) => a.day - b.day);
  };

  const chartData = prepareChartData();
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#6b486b",
    "#00C49F",
  ];

  const ChartContainer = ({ title, height, children }) => (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-[400px]" style={{ height }}>
        {children}
      </div>
    </div>
  );

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

  return (
    <div className="space-y-8">
      <ChartContainer title="Total Weight by Pigpen">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              label={<CustomizedAxisLabel value="Day" offset={20} />}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              label={{
                value: "Total Weight (kg)",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} kg`,
                `Pigpen ${name.split("_")[1]}`,
              ]}
              labelStyle={{ color: "#666" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value, entry) => `Pigpen ${value.split("_")[1]}`}
            />
            {data.pigpenData.map((pen, index) => (
              <Line
                key={pen.pigpenId}
                type="monotone"
                dataKey={`weight_${pen.pigpenId}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Daily Feed Intake (DFI)">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} kg/day`,
                `Pigpen ${name.split("_")[1]}`,
              ]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value, entry) => `Pigpen ${value.split("_")[1]}`}
            />
            {data.pigpenData.map((pen, index) => (
              <Line
                key={pen.pigpenId}
                type="monotone"
                dataKey={`dfi_${pen.pigpenId}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Cumulative Feed Intake (CFI)">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} kg`,
                `Pigpen ${name.split("_")[1]}`,
              ]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value, entry) => `Pigpen ${value.split("_")[1]}`}
            />
            {data.pigpenData.map((pen, index) => (
              <Line
                key={pen.pigpenId}
                type="monotone"
                dataKey={`cfi_${pen.pigpenId}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default OverviewStats;
