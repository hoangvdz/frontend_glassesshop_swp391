import axiosClient from "./axiosClient";

export const getAllOrders = async () => {
  return axiosClient.get("/orders");
};