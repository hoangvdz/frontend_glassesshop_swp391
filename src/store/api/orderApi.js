import axiosClient from "../api/axiosClient"

export const checkoutOrderApi = (payload) => {
    return axiosClient.post("/orders/checkout", payload);
}


export const historyOrderApi = () => {
    return axiosClient.get("/orders/my")
} 