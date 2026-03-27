import axiosClient from "./axiosClient";

export const getMyPrescriptionsApi = () => {
  return axiosClient.get("/prescriptions");
};

export const savePrescriptionApi = (data) => {
  return axiosClient.post("/prescriptions", data);
};

export const deletePrescriptionApi = (id) => {
  return axiosClient.delete(`/prescriptions/${id}`);
};
