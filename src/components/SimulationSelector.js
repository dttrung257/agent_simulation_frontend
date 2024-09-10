import { useState } from "react";
import Alert from "./Alert";

function SimulationSelector({ title, disabled, options, name, onChange }) {
  const [value, setValue] = useState(
    `Choose ${title.toString().toLowerCase()}`
  );
  const defaultValue = `Choose ${title.toString().toLowerCase()}`;
  const errorMessage = "You must select an option!";
  const successMessage = `${value} selected!`;

  return (
    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">
        {title}
      </h2>
      <form className="max-w-sm mb-4 mx-auto">
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Select {title.toString().toLowerCase()}
        </label>
        <select
          disabled={disabled}
          defaultValue={`Choose ${title.toString().toLowerCase()}`}
          onChange={onChange}
          name={name}
          onInput={(e) => setValue(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option hidden key="title">
            {defaultValue}
          </option>
          {Array.from(options).map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </form>

      {!disabled && value === defaultValue ? (
        <Alert type="error" content={errorMessage} />
      ) : disabled ? (
        <></>
      ) : (
        <Alert type="success" content={successMessage} />
      )}
    </div>
  );
}

export default SimulationSelector;
