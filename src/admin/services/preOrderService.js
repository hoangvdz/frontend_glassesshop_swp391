import axiosClient from "../api/axiosClient";

export const getAllPreOrderItems = async () => {
  const response = await axiosClient.get("/order-items/pre-orders");
  return response.data;
};

export const getPreOrderStats = async () => {
  const response = await axiosClient.get("/order-items/stats");
  return response.data;
};

// If you have specific preorder status update endpoints:
export const updatePreOrderStatus = async (orderItemId, data) => {
  const response = await axiosClient.put(`/order-items/${orderItemId}/pre-order`, data);
  return response.data;
};
