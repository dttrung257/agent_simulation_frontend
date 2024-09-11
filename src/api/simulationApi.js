import { axiosInstance } from "./axios";

export const getProject = async () => {
  return await axiosInstance.get("/projects");
};

export const getModelList = async () => {
  return await axiosInstance.get("/models");
};

export const getExperimentList = async (projectId, modelId) => {
  return await axiosInstance.get("/experiments", {
    project_id: projectId,
    model_id: modelId,
  });
};
