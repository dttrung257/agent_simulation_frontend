import { useState } from "react";
import Alert from "./Alert";

function SimulationInput({ title, disabled, options, name, onChange }) {
  const defaultValue =
    name !== "finalStep" ? `Select ${title.toString().toLowerCase()}` : 0;
  const [value, setValue] = useState(defaultValue);
  const errorInputFieldMessage = "Please provide a number between 1 and 1000.";

  const [error, setError] = useState(errorInputFieldMessage);

  const handleInputField = (e) => {
    setValue(e.target.value);
    if (e.target.value < 1 || e.target.value > 1000) {
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
            name={name}
            disabled={disabled}
            value={value}
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

      {!disabled && value !== defaultValue && name !== "finalStep" && (
        <Alert
          type="success"
          content="Your selection/input is complete. Proceed to the next section."
        />
      )}

      {!disabled && error === "No Error" && name === "finalStep" && (
        <Alert
          type="success"
          content="Your selection/input is complete. Proceed to the next section."
        />
      )}

      {!disabled &&
        error === errorInputFieldMessage &&
        name === "finalStep" && <Alert type="error" content={error} />}
    </div>
  );
}

export default SimulationInput;
