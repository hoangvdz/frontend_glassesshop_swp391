import axiosClient from "./axiosClient";

<<<<<<< HEAD
export const getAllOrders = async () => {
  return axiosClient.get("/orders");
};

export const updateOrderStatusApi = async (orderId, status) => {
  return axiosClient.patch(`/orders/${orderId}/status?status=${status}`);
};
=======
export const getAllOrdersApi = async () => {
  return axiosClient.get("/orders");
};

export const getOrderByIdApi = async (id) => {
  const res =  await axiosClient.get(`/orders/${id}`);
  return res.data;
};
>>>>>>> main
