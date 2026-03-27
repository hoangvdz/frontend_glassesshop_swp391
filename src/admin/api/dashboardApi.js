import axiosClient from "../api/axiosClient";

export const getOrdersCountApi = async () => {
  return axiosClient.get(`/orders/count`);
};
export const getCustomerCountApi = async () => {
  return axiosClient.get(`/orders/customers/count`);
};

