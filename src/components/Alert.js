import { InformationCircleIcon } from "@heroicons/react/24/solid";

function Alert({ type, content }) {
  const style = {
    success:
      "flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50",
    error:
      "flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50",
    info: "flex items-center p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50",
  };

  return (
    <div className={style[type]}>
      <InformationCircleIcon className="size-6 mr-4" />
      <div>{content}</div>
    </div>
  );
}

export default Alert;
