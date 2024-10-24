import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

function Alert({ type, message }) {
  const style = {
    success:
      "flex items-center gap-4 p-4 text-sm text-green-800 rounded-lg bg-green-50",
    error:
      "flex items-center gap-4 p-4 text-sm text-red-800 rounded-lg bg-red-50",
    info: "flex items-center gap-4 p-4 text-sm text-blue-800 rounded-lg bg-blue-50",
  };

  return (
    <div className={style[type]}>
      <div className="w-6">
        {type === "success" && <CheckCircleIcon className="size-6 mr-4" />}
        {type === "error" && <ExclamationCircleIcon className="size-6 mr-4" />}
        {type === "info" && <InformationCircleIcon className="size-6 mr-4" />}
      </div>
      <div>{message}</div>
    </div>
  );
}

export default Alert;
