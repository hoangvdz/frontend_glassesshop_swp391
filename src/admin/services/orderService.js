import {
  getAllOrdersApi,
  updateOrderStatusApi,
  getOrderByIdApi,
} from "../api/orderApi";

export const getAllOrders = async () => {
  const res = await getAllOrdersApi();
  // Backend trả về ApiResponse { data: [...] }
  const orders = res.data?.data || [];

  return orders.map((o) => ({
    id: o.orderId,
    code: o.orderCode,
    customer: o.userName,
    email: o.userEmail,
    avatar: `https://ui-avatars.com/api/?name=${o.userName}&background=random`,
    // ưu tiên finalPrice
    total: o.finalPrice ?? o.totalPrice ?? 0,
    status: mapStatus(o.status),
    createdAt: new Date(o.orderDate || Date.now()).toLocaleDateString("vi-VN"),
    orderItems: o.orderItems || o.items || [], // để modal dùng sau
  }));
};

export const getOrderById = async (id) => {
  const res = await getOrderByIdApi(id);
  // Backend trả về ApiResponse { data: {...} }
  const o = res.data?.data || res.data; 
  return {
    ...o,
    id: o.orderId,
    code: o.orderCode,
    customer: o.userName,
    email: o.userEmail,
    total: o.finalPrice ?? o.totalPrice ?? 0,
    status: mapStatus(o.status),
    createdAt: new Date(o.orderDate || Date.now()).toLocaleDateString("vi-VN"),
    orderItems: o.orderItems || o.items || [], // Đảm bảo luôn có orderItems cho Modal
  };
};

export const updateOrderStatus = async (orderId, status) => {
  // mapping status UI (lowercase) → backend (UPPERCASE)
  let backendStatus = status.toUpperCase();

  // Ánh xạ sang từ điển của Backend
  if (backendStatus === "SHIPPING" || backendStatus === "SHIPPED") backendStatus = "DELIVERING";
  if (backendStatus === "COMPLETED") backendStatus = "DELIVERED";
  if (backendStatus === "CANCELLED") backendStatus = "CANCELED";

  const res = await updateOrderStatusApi(orderId, backendStatus);
  return res.data;
};

const mapStatus = (status) => {
  if (!status) return "pending";
  const s = status.toUpperCase();
  switch (s) {
    case "PENDING":
      return "pending";
    case "PROCESSING":
      return "processing";
    case "DELIVERING":
    case "SHIPPING":
      return "shipped";
    case "DELIVERED":
    case "COMPLETED":
      return "completed";
    case "CANCELED":
    case "CANCELLED":
      return "cancelled";
    default:
      return s.toLowerCase();
  }
};
