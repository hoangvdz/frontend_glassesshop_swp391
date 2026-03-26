import axiosClient from "./axiosClient";

export const getAllOrders = async () => {
  return axiosClient.get("/orders");
};

export const updateOrderStatusApi = async (orderId, status) => {
  return axiosClient.patch(`/orders/${orderId}/status?status=${status}`);
};