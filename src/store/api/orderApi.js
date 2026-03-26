import axiosClient from "../api/axiosClient"

export const checkoutOrderApi = (payload) => {
    return axiosClient.post("/orders/checkout", payload);
}


export const historyOrderApi = () => {
    return axiosClient.get("/orders/my")
}

export const cancelOrderApi = (orderId) => {
    return axiosClient.patch(`/orders/${orderId}/status?status=CANCELED`);
}

export const getOrderByIdApi = (id) => {
    return axiosClient.get(`/orders/${id}`);
} 