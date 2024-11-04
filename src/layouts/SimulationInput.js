import { useState } from "react";

const FRAME_RATE = 45;

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
  const errorInputFieldMessage =
    "Please provide a number between 1 and 100,000.";
  const errorInputFormat =
    "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5";
  const validInputFormat =
    "bg-green-50 border border-green-500 text-green-900 placeholder-green-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5";
  const defaultInputFormat =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";

  const [error, setError] = useState(errorInputFieldMessage);
  const [timeString, setTimeString] = useState("");

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
      ? `${days} days, ${formattedHours}:${formattedMinutes}:${formattedSeconds}s`
      : `${formattedHours}:${formattedMinutes}:${formattedSeconds}s`;
  };

  const handleInputField = (e) => {
    const value = parseInt(e.target.value);
    setValue(value);

    if (value < 1 || value > 100000) {
      setError(errorInputFieldMessage);
      setTimeString("");
    } else if (value % FRAME_RATE !== 0) {
      setError(`Value must be a multiple of ${FRAME_RATE}`);
      setTimeString("");
    } else {
      setError("No Error");
      setTimeString(formatTime(value)); // 1 step = 1 second
    }
  };

  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 truncate text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <form className="w-full mb-4 mx-auto">
        {name !== "finalStep" ? (
          <select
            disabled={disabled || isSimulationRunning}
            onChange={onChange}
            value={value}
            name={name}
            onInput={(e) => {
              setValue(e.target.value);
            }}
            className={
              currentValue === null ? defaultInputFormat : validInputFormat
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
        ) : (
          <>
            <input
              type="number"
              disabled={isSimulationRunning}
              name={name}
              value={value}
              className={
                value === defaultValue
                  ? defaultInputFormat
                  : value > 0 && value <= 100000 && value % FRAME_RATE === 0
                  ? validInputFormat
                  : errorInputFormat
              }
              placeholder={`Enter multiple of ${FRAME_RATE} (1-100,000)`}
              onChange={onChange}
              onInput={(e) => handleInputField(e)}
              required
            />
            {timeString && (
              <p className="mt-2 text-sm text-blue-600">End at: {timeString}</p>
            )}
            {error !== "No Error" && (
              <p className="mt-2 text-sm text-red-600">
                <span className="font-medium">{error}</span>
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default SimulationInput;
