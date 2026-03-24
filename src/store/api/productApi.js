import axios from "axios";

const BASE_URL = "http://localhost:8081/api";

export const getAllProductStoreApi = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data.data;
};