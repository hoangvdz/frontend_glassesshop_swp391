import { getAllOrdersApi, getOrderByIdApi } from "../api/orderApi";

export const getAllOrders = async () => {
  const res = await getAllOrdersApi();

  return res.data.data.map((o) => ({
    id: o.orderId,
    code: o.orderCode,
    customer: o.userName,
    email: o.userEmail,
    avatar: "https://i.pravatar.cc/40",

    // ưu tiên finalPrice
    total: o.finalPrice ?? o.totalPrice ?? 0,

    status: mapStatus(o.status),

    createdAt: new Date(o.orderDate).toLocaleDateString("vi-VN"),

    items: o.orderItems, // để modal dùng sau
  }));
};

const mapStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "pending";
    case "SHIPPED":
      return "shipped"; // ✅ FIX
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
};


export const getOrderById = async (id) => {
  const res = await getOrderByIdApi(id);
  const o = res.data;
  return {
    id: o.orderId,
    code: o.orderCode,
    customer: o.userName,
    email: o.userEmail,
    total: o.totalPrice,
    status: o.status?.toLowerCase(),
    createdAt: o.orderDate,
    items: o.orderItems,
  };
};
