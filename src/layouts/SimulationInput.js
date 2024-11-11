import { useState } from "react";

const FRAME_RATE = 45;
const MAX_DISPLAY_STEPS = 3840;
const MAX_DAYS = Math.floor(
  (MAX_DISPLAY_STEPS * FRAME_RATE * 60) / (24 * 60 * 60)
);

function SimulationInput({
  title,
  currentValue,
  disabled,
  options,
  name,
  onChange,
  isSimulationRunning,
}) {
  const defaultValue =
    name !== "finalStep" ? `Select ${title.toString().toLowerCase()}` : 0;
  const [value, setValue] = useState(defaultValue);
  const [inputMode, setInputMode] = useState("days");
  const [daysValue, setDaysValue] = useState(0);
  const errorInputFieldMessage = `Please provide a number between 1 and ${MAX_DISPLAY_STEPS}`; // Changed from 0 to 1
  const errorDaysMessage = `Please provide a number between 1 and ${MAX_DAYS} days.`;
  const errorInputFormat =
    "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5";
  const validInputFormat =
    "bg-green-50 border border-green-500 text-green-900 placeholder-green-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5";
  const defaultInputFormat =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";

  const [error, setError] = useState(errorInputFieldMessage);
  const [timeString, setTimeString] = useState("");
  const [displayStep, setDisplayStep] = useState(0); // Changed from 0 to 1

  const formatTime = (seconds) => {
    seconds = seconds * 60;
    const days = Math.floor(seconds / (24 * 3600));
    const remainingSeconds = seconds % (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = secs.toString().padStart(2, "0");

    return days > 0
      ? `${days} days, ${formattedHours}:${formattedMinutes}:${formattedSeconds}`
      : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const handleInputField = (e) => {
    const displayStepValue = parseInt(e.target.value);
    setDisplayStep(displayStepValue);

    // Convert display step to final step
    const finalStepValue = displayStepValue * FRAME_RATE;
    setValue(finalStepValue);

    if (
      !displayStepValue ||
      displayStepValue < 1 ||
      displayStepValue > MAX_DISPLAY_STEPS
    ) {
      // Changed validation
      setError(`Please provide a number between 1 and ${MAX_DISPLAY_STEPS}`);
      setTimeString("");
    } else {
      setError("No Error");
      setTimeString(formatTime(finalStepValue));

      // Update parent component with final step value
      if (onChange) {
        const event = {
          target: {
            name: "finalStep",
            value: finalStepValue,
          },
        };
        onChange(event);
      }
    }
  };

  const handleDaysInput = (e) => {
    const days = parseInt(e.target.value);
    setDaysValue(days);

    if (!days || days < 1 || days > MAX_DAYS) {
      setError(errorDaysMessage);
      setTimeString("");
      return;
    }

    // Convert days to steps: days * 24 hours * 60 minutes + 1
    const steps = days * 24 * 60 + 1;

    // Round to nearest multiple of FRAME_RATE
    const roundedSteps = Math.round(steps / FRAME_RATE) * FRAME_RATE;
    setValue(roundedSteps);

    // Update the simulation with the calculated steps
    if (onChange) {
      const event = {
        target: {
          name: "finalStep",
          value: roundedSteps,
        },
      };
      onChange(event);
    }

    setError("No Error");
    setTimeString(formatTime(roundedSteps));
  };

  if (name !== "finalStep") {
    return (
      <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
        <h2 className="mb-4 truncate text-2xl font-semibold tracking-tight text-gray-900 text-center">
          {title}
        </h2>
        <form className="w-full mb-4 mx-auto">
          <select
            disabled={disabled || isSimulationRunning}
            onChange={onChange}
            value={value}
            name={name}
            onInput={(e) => {
              setValue(e.target.value);
            }}
            className={
              disabled || isSimulationRunning
                ? "bg-gray-100 border border-gray-200 text-gray-400 text-sm rounded-lg cursor-not-allowed block w-full p-2.5"
                : currentValue === null
                ? defaultInputFormat
                : validInputFormat
            }
          >
            <option hidden key="title">
              {defaultValue}
            </option>
            {options !== undefined &&
              Array.from(options).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
          </select>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 truncate text-2xl font-semibold tracking-tight text-gray-900 text-center">
        {title}
      </h2>
      <div className="flex gap-2 mb-4 justify-center">
        <button
          type="button"
          onClick={() => {
            setInputMode("step");
            setError(errorInputFieldMessage);
            setTimeString("");
            setDisplayStep(0); // Reset về giá trị mặc định
            setValue(0); // Reset value về 0
            if (onChange) {
              // Reset parent value
              onChange({
                target: {
                  name: "finalStep",
                  value: 0,
                },
              });
            }
          }}
          className={`px-3 py-1 rounded-md ${
            inputMode === "step"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          By Steps
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode("days");
            setError(errorDaysMessage);
            setTimeString("");
            setDaysValue(0); // Reset về giá trị mặc định
            setValue(0); // Reset value về 0
            if (onChange) {
              // Reset parent value
              onChange({
                target: {
                  name: "finalStep",
                  value: 0,
                },
              });
            }
          }}
          className={`px-3 py-1 rounded-md ${
            inputMode === "days"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          By Days
        </button>
      </div>
      <form className="w-full mb-4 mx-auto">
        {inputMode === "step" ? (
          <input
            type="number"
            disabled={isSimulationRunning}
            name={name}
            value={displayStep}
            min="1" // Added min attribute
            max={MAX_DISPLAY_STEPS} // Added max attribute
            className={
              error === "No Error" ? validInputFormat : errorInputFormat
            }
            placeholder={`Enter number of steps (1-${MAX_DISPLAY_STEPS})`} // Changed from 0 to 1
            onChange={(e) => handleInputField(e)}
            onInput={(e) => handleInputField(e)}
            required
          />
        ) : (
          <input
            type="number"
            disabled={isSimulationRunning}
            value={daysValue}
            className={
              error === "No Error" ? validInputFormat : errorInputFormat
            }
            placeholder={`Enter number of days (1-${MAX_DAYS})`}
            onChange={handleDaysInput}
            required
            min="1"
            max={MAX_DAYS}
          />
        )}
        {timeString && (
          <div className="mt-3 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-green-200 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-sm font-medium text-green-700">
                End at: {timeString}
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default SimulationInput;
