import React, { useMemo, useState, useEffect } from "react";
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

const generateDistinctColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    colors.push(`hsl(${hue}, 70%, 45%)`);
  }

  return colors;
};

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

const PigSelector = ({ pigs, selectedPigs, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Select Pigs to Display
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => onChange(pigs.map((pig) => pig.pigId))}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            Show All
          </button>
          <button
            onClick={() => onChange([])}
            className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
          >
            Hide All
          </button>
          <button
            onClick={() => {
              const shuffled = [...pigs].sort(() => 0.5 - Math.random());
              onChange(shuffled.slice(0, 5).map((pig) => pig.pigId));
            }}
            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100"
          >
            Random 5
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
        {pigs.map((pig) => (
          <label key={pig.pigId} className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedPigs.includes(pig.pigId)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selectedPigs, pig.pigId]);
                } else {
                  onChange(selectedPigs.filter((id) => id !== pig.pigId));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Pig {pig.pigId}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const PigpenStats = ({ data, selectedPigpen, setSelectedPigpen }) => {
  const [selectedPigs, setSelectedPigs] = useState([]);
  const [colors, setColors] = useState([]);

  const preparePigpenData = useMemo(() => {
    if (!selectedPigpen) return [];

    const pigpen = data.pigpenData.find(
      (pen) => pen.pigpenId === selectedPigpen
    );
    if (!pigpen) return [];

    return pigpen.pigData[0].pigDaily.map((_, dayIndex) => {
      const dayData = {
        day: dayIndex,
        avgWeight: 0,
        avgDFI: 0,
        avgCFI: 0,
      };

      let validPigCount = 0;
      pigpen.pigData.forEach((pig) => {
        const daily = pig.pigDaily[dayIndex];
        if (daily) {
          dayData.avgWeight += daily.weight;
          dayData.avgDFI += daily.dfi;
          dayData.avgCFI += daily.cfi;
          validPigCount++;
        }
      });

      if (validPigCount > 0) {
        dayData.avgWeight /= validPigCount;
        dayData.avgDFI /= validPigCount;
        dayData.avgCFI /= validPigCount;
      }

      return dayData;
    });
  }, [data, selectedPigpen]);

  const prepareIndividualPigData = useMemo(() => {
    if (!selectedPigpen) return [];

    const pigpen = data.pigpenData.find(
      (pen) => pen.pigpenId === selectedPigpen
    );
    if (!pigpen) return [];

    return pigpen.pigData.map((pig) => ({
      pigId: pig.pigId,
      dailyData: pig.pigDaily,
    }));
  }, [data, selectedPigpen]);

  useEffect(() => {
    if (selectedPigpen) {
      const pigIds = prepareIndividualPigData.map((pig) => pig.pigId);
      setSelectedPigs(pigIds);
      setColors(generateDistinctColors(pigIds.length));
    }
  }, [selectedPigpen, prepareIndividualPigData]);

  const filteredPigData = useMemo(() => {
    return prepareIndividualPigData.filter((pig) =>
      selectedPigs.includes(pig.pigId)
    );
  }, [prepareIndividualPigData, selectedPigs]);

  const CustomTooltip = ({ title, unit, active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-600 mb-2">Day {label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: {Number(entry.value).toFixed(2)} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Pigpen Selector */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Select Pigpen
        </h3>
        <div className="flex flex-wrap gap-3">
          {data.pigpenData.map((pen) => (
            <button
              key={pen.pigpenId}
              onClick={() => setSelectedPigpen(pen.pigpenId)}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                ${
                  selectedPigpen === pen.pigpenId
                    ? "bg-blue-600 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              Pigpen {pen.pigpenId}
            </button>
          ))}
        </div>
      </div>

      {selectedPigpen && (
        <>
          {/* Average Stats */}
          <ChartContainer title="Pigpen Averages">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Average Weight</div>
                <div className="text-2xl font-bold text-gray-900">
                  {preparePigpenData[
                    preparePigpenData.length - 1
                  ]?.avgWeight.toFixed(2)}{" "}
                  kg
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Average DFI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {preparePigpenData[
                    preparePigpenData.length - 1
                  ]?.avgDFI.toFixed(2)}{" "}
                  kg/day
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Average CFI</div>
                <div className="text-2xl font-bold text-gray-900">
                  {preparePigpenData[
                    preparePigpenData.length - 1
                  ]?.avgCFI.toFixed(2)}{" "}
                  kg
                </div>
              </div>
            </div>
          </ChartContainer>

          {/* Pig Selector */}
          <PigSelector
            pigs={prepareIndividualPigData}
            selectedPigs={selectedPigs}
            onChange={setSelectedPigs}
          />

          {/* Individual Weight Chart */}
          <ChartContainer title="Individual Pig Weights">
            <ResponsiveContainer>
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  domain={[
                    Math.min(
                      0,
                      Math.min(
                        ...filteredPigData.flatMap((pig) =>
                          pig.dailyData.map((data) => data.weight)
                        )
                      )
                    ),
                    Math.max(
                      ...filteredPigData.flatMap((pig) =>
                        pig.dailyData.map((data) => data.weight)
                      )
                    ),
                  ]}
                  label={{
                    value: "Weight (kg)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip title="Weight" unit="kg" />} />
                <Legend
                  verticalAlign="top"
                  height={48}
                  wrapperStyle={{
                    paddingLeft: "10px",
                    overflowY: "auto",
                    maxHeight: "80px",
                  }}
                />
                {filteredPigData.map((pig, index) => (
                  <Line
                    key={pig.pigId}
                    data={pig.dailyData}
                    type="monotone"
                    dataKey="weight"
                    name={`Pig ${pig.pigId}`}
                    stroke={colors[index]}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Individual DFI Chart */}
          <ChartContainer title="Individual Pig Daily Feed Intake (DFI)">
            <ResponsiveContainer>
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{
                    value: "DFI (kg/day)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip title="DFI" unit="kg/day" />}
                />
                <Legend
                  verticalAlign="top"
                  height={48}
                  wrapperStyle={{
                    paddingLeft: "10px",
                    overflowY: "auto",
                    maxHeight: "80px",
                  }}
                />
                {filteredPigData.map((pig, index) => (
                  <Line
                    key={pig.pigId}
                    data={pig.dailyData}
                    type="monotone"
                    dataKey="dfi"
                    name={`Pig ${pig.pigId}`}
                    stroke={colors[index]}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Individual CFI Chart */}
          <ChartContainer title="Individual Pig Cumulative Feed Intake (CFI)">
            <ResponsiveContainer>
              <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  label={<CustomizedAxisLabel value="Day" offset={20} />}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  label={{
                    value: "CFI (kg)",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                  }}
                />
                <Tooltip content={<CustomTooltip title="CFI" unit="kg" />} />
                <Legend
                  verticalAlign="top"
                  height={48}
                  wrapperStyle={{
                    paddingLeft: "10px",
                    overflowY: "auto",
                    maxHeight: "80px",
                  }}
                />
                {filteredPigData.map((pig, index) => (
                  <Line
                    key={pig.pigId}
                    data={pig.dailyData}
                    type="monotone"
                    dataKey="cfi"
                    name={`Pig ${pig.pigId}`}
                    stroke={colors[index]}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}
    </div>
  );
};

export default PigpenStats;
