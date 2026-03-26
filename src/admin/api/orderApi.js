import axiosClient from "./axiosClient";

export const getAllOrdersApi = () => {
  return axiosClient.get("/orders");
};