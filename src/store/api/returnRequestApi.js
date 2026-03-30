import axiosClient from "./axiosClient";

export const createReturnRequestApi = (data) => {
    return axiosClient.post("/return-requests", data);
};
// ADMIN / STAFF lấy danh sách yêu cầu đổi/trả
export const getAllReturnRequestsApi = () => {
    return axiosClient.get("/return-requests");
};

// ADMIN / STAFF cập nhật status
export const updateReturnRequestStatusApi = (id, payload) => {
    return axiosClient.patch(`/return-requests/${id}/status`, payload);
};

export const getReturnRequestByOrderItemApi = (orderItemId) => {
    return axiosClient.get(`/return-requests/order-item/${orderItemId}`);
};