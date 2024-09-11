import { useState } from "react";
import Alert from "./Alert";

function SimulationInput({ title, disabled, options, name, onChange }) {
  const defaultValue =
    name !== "finalStep" ? `Select ${title.toString().toLowerCase()}` : 0;
  const [value, setValue] = useState(defaultValue);

  const [error, setError] = useState("");

  const handleInputField = (e) => {
    if (e.target.value < 1 || e.target.value > 1000) {
      setError("Please provide a number between 1 and 1000.");
    } else {
      setError("");
    }
  };

  return (
    <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <form className="max-w-sm mb-4 mx-auto">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Choose {title.toString().toLowerCase()}
        </label>
        {name !== "finalStep" ? (
          <select
            disabled={disabled}
            defaultValue={`Select ${title.toString().toLowerCase()}`}
            onChange={onChange}
            name={name}
            onInput={(e) => {
              setValue(e.target.value);
            }}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
          <input
            type="number"
            disabled={disabled}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="1-1000"
            onChange={onChange}
            onInput={(e) => handleInputField(e)}
            required
          />
        )}
      </form>

      {!disabled && value === defaultValue && name !== "finalStep" && (
        <Alert
          type="error"
          content="Please provide your details in the input field."
        />
      )}

      {!disabled && value !== defaultValue && error === "" && (
        <Alert
          type="success"
          content="Your selection/input is complete. Proceed to the next section."
        />
      )}

      {error && <Alert type="error" content={error} />}
    </div>
  );
}

export default SimulationInput;
