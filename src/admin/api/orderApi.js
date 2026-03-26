import axiosClient from "./axiosClient";

export const getAllOrdersApi = async () => {
  return axiosClient.get("/orders");
};

export const getOrderByIdApi = async (id) => {
  const res =  await axiosClient.get(`/orders/${id}`);
  return res.data;
};
