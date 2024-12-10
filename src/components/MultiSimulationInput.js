import React, { useState, useEffect } from "react";
import Alert from "../layouts/Alert";

// const 24 * 60 = 1440;

function MultiSimulationInput({ onSubmit, isSimulationRunning, disabled }) {
  const [simulationParams, setSimulationParams] = useState({
    days: 10,
    numberPigpen: 3,
    selectedPigpens: [], // Chuồng được chọn để phát bệnh
    diseaseDays: {}, // Ngày phát bệnh tương ứng với từng chuồng
    pigNumbers: {}, // Số lượng heo trong mỗi chuồng
  });

  const [errors, setErrors] = useState({});
  const [pigpens, setPigpens] = useState([]);

  useEffect(() => {
    if (simulationParams.numberPigpen > 0) {
      // Tạo danh sách chuồng dựa trên số lượng đã chọn
      const newPigpens = Array.from(
        { length: simulationParams.numberPigpen },
        (_, i) => i + 1
      );
      setPigpens(newPigpens);

      // Reset và set giá trị mặc định số heo là 20 cho mỗi chuồng
      const defaultPigNumbers = {};
      newPigpens.forEach((pen) => {
        defaultPigNumbers[pen] = 20;
      });

      // Reset các giá trị khác khi thay đổi số lượng chuồng
      setSimulationParams((prev) => ({
        ...prev,
        selectedPigpens: [],
        diseaseDays: {},
        pigNumbers: defaultPigNumbers,
      }));
    }
  }, [simulationParams.numberPigpen]);

  const validateForm = () => {
    const newErrors = {};

    if (simulationParams.days < 1) {
      newErrors.days = "Days must be greater than 0";
    }

    if (simulationParams.numberPigpen < 1) {
      newErrors.numberPigpen = "Number of pigpens must be greater than 0";
    }

    // Kiểm tra các chuồng được chọn phải có ngày phát bệnh tương ứng
    if (simulationParams.selectedPigpens.length > 0) {
      simulationParams.selectedPigpens.forEach((pen) => {
        if (!simulationParams.diseaseDays[pen]) {
          newErrors.diseaseDays =
            "Please set disease day for all selected pigpens";
        }
      });
    }

    // Kiểm tra số lượng heo phải > 0
    Object.values(simulationParams.pigNumbers).forEach((number) => {
      if (number < 1) {
        newErrors.pigNumbers =
          "Number of pigs must be greater than 0 for all pigpens";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Prepare data for API
    const params = {
      finalStep: simulationParams.days * 24 * 60 + 1,
      numberPigpen: simulationParams.numberPigpen,
      initDiseaseAppearPigpenIds: simulationParams.selectedPigpens.join(","),
      initDiseaseAppearDays: simulationParams.selectedPigpens
        .map((pen) => simulationParams.diseaseDays[pen])
        .join(","),
      numberPigs: Object.values(simulationParams.pigNumbers).join(","),
    };

    onSubmit(params);
  };

  const handlePigpenSelect = (penId) => {
    setSimulationParams((prev) => {
      const isSelected = prev.selectedPigpens.includes(penId);
      const newSelected = isSelected
        ? prev.selectedPigpens.filter((id) => id !== penId)
        : [...prev.selectedPigpens, penId].sort((a, b) => a - b);

      // Nếu bỏ chọn chuồng, xóa disease day tương ứng
      const newDiseaseDays = { ...prev.diseaseDays };
      if (isSelected) {
        delete newDiseaseDays[penId];
      }

      return {
        ...prev,
        selectedPigpens: newSelected,
        diseaseDays: newDiseaseDays,
      };
    });
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 text-2xl font-semibold text-center">
        Farm Simulation Setup
      </h2>

      {/* Basic Configuration */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Simulation Days
          </label>
          <input
            type="number"
            value={simulationParams.days}
            onChange={(e) =>
              setSimulationParams((prev) => ({
                ...prev,
                days: parseInt(e.target.value),
              }))
            }
            disabled={disabled || isSimulationRunning}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            min="1"
          />
          {errors.days && (
            <p className="mt-2 text-sm text-red-600">{errors.days}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Number of Pigpens
          </label>
          <input
            type="number"
            value={simulationParams.numberPigpen}
            onChange={(e) =>
              setSimulationParams((prev) => ({
                ...prev,
                numberPigpen: parseInt(e.target.value),
              }))
            }
            disabled={disabled || isSimulationRunning}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            min="1"
          />
          {errors.numberPigpen && (
            <p className="mt-2 text-sm text-red-600">{errors.numberPigpen}</p>
          )}
        </div>
      </div>

      {/* Disease Configuration */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium">Pigpen Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          {pigpens.map((pen) => (
            <div key={pen} className="p-4 border rounded-lg">

              <div className="flex items-center mb-2">
              <span className="text-sm font-bold text-gray-900">Pigpen {pen}</span>
              </div>

              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id={`pigpen-${pen}`}
                  checked={simulationParams.selectedPigpens.includes(pen)}
                  onChange={() => handlePigpenSelect(pen)}
                  disabled={disabled || isSimulationRunning}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`pigpen-${pen}`}
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  Disease Configuration
                </label>
              </div>

              <div className="space-y-3">
                {/* Disease Day input chỉ hiện khi chuồng được chọn */}
                {simulationParams.selectedPigpens.includes(pen) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ASF Disease outbreak day
                    </label>
                    <input
                      type="number"
                      value={simulationParams.diseaseDays[pen] || ""}
                      onChange={(e) =>
                        setSimulationParams((prev) => ({
                          ...prev,
                          diseaseDays: {
                            ...prev.diseaseDays,
                            [pen]: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      min="1"
                      max={simulationParams.days}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Pigs
                  </label>
                  <input
                    type="number"
                    value={simulationParams.pigNumbers[pen] || 20}
                    onChange={(e) =>
                      setSimulationParams((prev) => ({
                        ...prev,
                        pigNumbers: {
                          ...prev.pigNumbers,
                          [pen]: parseInt(e.target.value),
                        },
                      }))
                    }
                    disabled={disabled || isSimulationRunning}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.diseaseDays && (
          <Alert type="error" message={errors.diseaseDays} />
        )}
        {errors.pigNumbers && (
          <Alert type="error" message={errors.pigNumbers} />
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={disabled || isSimulationRunning}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Farm Simulation
        </button>
      </div>
    </div>
  );
}

export default MultiSimulationInput;
