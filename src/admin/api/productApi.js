import axios from "axios";

const BASE_URL = "http://localhost:8081/api";

export const getAllProductsApi = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data.data;
};


export const createProductApi = async (productData) => {
      const res = await axios.post(`${BASE_URL}/products`, productData);
      return res.data.data;
};

