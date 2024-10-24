import { useState } from "react";

function SimulationInput({
  title,
  currentValue,
  disabled,
  options,
  name,
  onChange,
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

  const handleInputField = (e) => {
    setValue(e.target.value);
    if (e.target.value < 1 || e.target.value > 100000) {
      setError(errorInputFieldMessage);
    } else {
      setError("No Error");
    }
  };

  return (
    <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <form className="w-full mb-4 mx-auto">
        <label className="block truncate mb-2 text-sm font-medium text-gray-900">
          Choose {title.toString().toLowerCase()}
        </label>
        {name !== "finalStep" ? (
          <select
            disabled={disabled}
            defaultValue={`Select ${title.toString().toLowerCase()}`}
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
              name={name}
              value={value}
              className={
                value === defaultValue
                  ? defaultInputFormat
                  : value > 0 && value <= 100000
                  ? validInputFormat
                  : errorInputFormat
              }
              placeholder="1-100,000"
              onChange={onChange}
              onInput={(e) => handleInputField(e)}
              required
            />
            {(value < 1 || value > 100000) && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                Please enter number between{" "}
                <span className="font-medium">1-100,000</span>
              </p>
            )}
          </>
        )}
      </form>

      {!disabled &&
        error === errorInputFieldMessage &&
        name === "finalStep" && <></>}
    </div>
  );
}

export default SimulationInput;
