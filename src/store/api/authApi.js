import axios from "axios";

// API LOGIN
// URL
const BASE_URL = "http://localhost:8081/api";

export const loginApi = async (email, password) => {
  const res = await axios.post(`${BASE_URL}/users/authencation`, null, {
    params: {
      email: email,
      password: password,
    },
  });

  return res.data;
};

export const getUserById = async (userId) => {
  const res = await axios.get(`${BASE_URL}/users/${userId}`);
  return res.data.data;
};
