import axiosClient from "../api/axiosClient"

export const checkoutOrderApi = (payload) => {
    return axiosClient.post("/orders/checkout", payload);
}