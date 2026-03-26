import axiosClient from "../api/axiosClient";

export const getAllProductsApi = async () => {
  const res = await axiosClient.get(`/products`);
  return res.data.data;
};

export const createProductApi = async (productData) => {
  const res = await axiosClient.post(`/products`, productData);
  return res.data.data;
};

export const deleteProductApi = async (id) => {
  const res = await axiosClient.delete(`/products/${id}`);
  return res.data;
};