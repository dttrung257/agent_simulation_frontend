import { axiosInstance } from "./axios";

export const getNodeList = async () => {
  return await axiosInstance.get("/nodes");
};

export const getProjectList = async () => {
  return await axiosInstance.get("/projects");
};

export const getModelOptionsList = async (projectId, hasExperiment) => {
  return await axiosInstance.get(
    `/models?project_id=${projectId}&has_experiment=${hasExperiment}`
  );
};

export const getModelList = async () => {
  return await axiosInstance.get(`/models`);
};

export const getModelListByProjectId = async (projectId) => {
  return await axiosInstance.get(`/models?project_id=${projectId}`);
};

export const getExperimentList = async (projectId, modelId) => {
  return await axiosInstance.get(
    `/experiments?model_id=${modelId}&project_id=${projectId}`
  );
};

export const runSimulation = async (simulationRequests) => {
  return await axiosInstance.post("/simulations/cluster", {
    simulationRequests: simulationRequests,
  });
};

export const stopSimulation = async (resultId) => {
  return await axiosInstance.delete(`/experiment_results/${resultId}/stop`);
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

export const getDownloadSimulationResultURL = async (resultId) => {
  return await axiosInstance.get(`/experiment_results/${resultId}`);
};

export const getExperimentResultDetail = async (resultId) => {
  return await axiosInstance.get(`/experiment_results/${resultId}`);
};

export const getSimulationResults = async (projectId) => {
  return await axiosInstance.get(`/simulations?project_id=${projectId}`);
};

export const deleteSimulation = async (simulationId) => {
  return await axiosInstance.delete(`/simulations/${simulationId}`);
};

export const runMultiSimulation = async (params) => {
  return await axiosInstance.post("/simulations/cluster/multi_simulation", {
    finalStep: params.finalStep,
    numberPigpen: params.numberPigpen,
    initDiseaseAppearPigpenIds: params.initDiseaseAppearPigpenIds,
    initDiseaseAppearDays: params.initDiseaseAppearDays,
    numberPigs: params.numberPigs,
  });
};

export const getStatistics = async (resultIds) => {
  return await axiosInstance.get(
    `/simulation_statistics?experiment_result_ids=${resultIds}`
  );
};

export const getNodeMetrics = async () => {
  // return await axiosInstance.get("/metrics");
};

export const getMetricValue = async (url) => {
  return await axiosInstance.get(url);
};

export const getSimulationMetrics = async (resultIds) => {
  return await axiosInstance.get(
    `/metrics/simulation?experiment_result_ids=${resultIds}`
  );
};
