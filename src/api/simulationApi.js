import { axiosInstance } from "./axios";

export const getProject = async () => {
  return await axiosInstance.get("/projects");
};

export const getModelOptions = async (projectId, hasExperiment) => {
  return await axiosInstance.get(
    `/models?project_id=${projectId}&has_experiment=${hasExperiment}`
  );
};

export const getModelList = async () => {
  return await axiosInstance.get(`/models`);
};

export const getExperimentList = async (projectId, modelId) => {
  return await axiosInstance.get(
    `/experiments?model_id=${modelId}&project_id=${projectId}`
  );
};

export const runSimulation = async (simulationInfo) => {
  return await axiosInstance.post("/simulations/cluster", simulationInfo);
};

export const getResultStatus = async (resultId) => {
  return await axiosInstance.get(`/experiment_results/${resultId}/progress`);
};

export const getExperimentResult = async (projectId, modelId, experimentId) => {
  return await axiosInstance.get(
    `experiment_results?project_id=${projectId}&model_id=${modelId}&experiment_id=${experimentId}`
  );
};

export const getExperimentResultImages = async (
  projectId,
  modelId,
  experimentId,
  experimentResultId
) => {
  return await axiosInstance.get(
    `experiment_result_images?project_id=${projectId}&model_id=${modelId}&experiment_id=${experimentId}&experiment_result_id=${experimentResultId}`
  );
};

export const getCategoriesResult = async (resultId) => {
  return await axiosInstance.get(
    `/experiment_result_categories?experiment_result_id=${resultId}`
  );
};

export const getImageResultFromRange = async (
  resultId,
  startStep,
  finalStep
) => {
  return await axiosInstance.get(
    `/experiment_result_images?experiment_result_id=${resultId}&start_step=${startStep}&end_step=${finalStep}`
  );
};
