import {
  getCustomerCountApi,
  getOrdersCountApi,
  getRevenueReportApi,
  getDailyRevenueApi,
  getCancelledOrdersApi,
} from "../api/dashboardApi";

export const getOrdersCount = async () => {
  const res = await getOrdersCountApi();
  return res.data.data;
};

export const getCustomerCount = async () => {
  const res = await getCustomerCountApi();
  return res.data.data;
};

export const getRevenueReport = async (fromDate, toDate) => {
  const res = await getRevenueReportApi(fromDate, toDate);
  return res.data.data;
};

export const getDailyRevenue = async (fromDate, toDate) => {
  const res = await getDailyRevenueApi(fromDate, toDate);
  return res.data.data;
};

export const getCancelledOrders = async (fromDate, toDate) => {
  const res = await getCancelledOrdersApi(fromDate, toDate);
  return res.data.data;
};
