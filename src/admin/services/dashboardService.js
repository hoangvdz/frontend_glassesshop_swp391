import { getCustomerCountApi, getOrdersCountApi } from "../api/dashboardApi";

export const getOrdersCount = async () => {
  const res = await getOrdersCountApi();
  return res.data.data;
};

export const getCustomerCount = async () => {
  const res = await getCustomerCountApi();
  return res.data.data;
}
