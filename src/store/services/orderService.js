import {
  historyOrderApi,
  cancelOrderApi,
  getOrderByIdApi,
  updatePaymentStatusApi,
} from "../api/orderApi";

// map status backend → frontend
const mapStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "PROCESSING":
      return "PROCESSING";
    case "DELIVERING":
    case "SHIPPING":
      return "SHIPPING";
    case "DELIVERED":
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELED":
    case "CANCELLED":
      return "CANCELLED";
    default:
      return status || "PENDING";
  }
};

const mapStatusLabel = (status) => {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "PROCESSING":
      return "Đang đóng gói";
    case "DELIVERING":
    case "SHIPPING":
      return "Đang giao hàng";
    case "DELIVERED":
    case "COMPLETED":
      return "Giao thành công";
    case "CANCELED":
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status || "Chờ xác nhận";
  }
};

export const getMyOrders = async () => {
  const res = await historyOrderApi();

  const rawOrders = res.data.data;

  // transform data cho UI
  return rawOrders.map((order) => ({
    id: order.orderCode,
    orderId: order.orderId, // ✅ Cần dùng để gọi API update
    date: new Date(order.orderDate).toLocaleDateString("vi-VN"),
    status: mapStatus(order.status),
    total: order.finalPrice,

    items: order.orderItems.map((item) => ({
      orderItemId: item.orderItemId, // ✅ Cần để đổi trả
      productId: item.productId, // ✅ Thêm để có link qua trang Review
      name: item.productName,
      quantity: item.quantity,
      image: item.imageUrl,
    })),
  }));
};

export const cancelOrder = async (orderId) => {
  const res = await cancelOrderApi(orderId);
  return res.data;
};

export const getOrderDetails = async (id) => {
  const res = await getOrderByIdApi(id);
  const order = res.data.data;

  // Trình trạng số (0, 1, 2, 3) cho thanh tiến trình
  let statusCode = 0;
  switch (order.status) {
    case "PENDING":
      statusCode = 0;
      break;
    case "PROCESSING":
      statusCode = 1;
      break;
    case "DELIVERING":
    case "SHIPPING":
      statusCode = 2;
      break;
    case "DELIVERED":
    case "COMPLETED":
      statusCode = 3;
      break;
    default:
      statusCode = 0;
  }

  return {
    id: order.orderCode,
    date: new Date(order.orderDate).toLocaleDateString("vi-VN"),
    status: statusCode,
    rawStatus: mapStatusLabel(order.status),
  };
};

export const updatePaymentStatus = async (orderId, resCode, transCode) => {
  const isSuccess = resCode === "00" && transCode === "00";
  const status = isSuccess ? "PAID" : "UNPAID";
  try {
    const res = await updatePaymentStatusApi(orderId, status);

    console.log("Service response:", res.data);

    return res.data;
  } catch (error) {
    console.error("Service error:", error);
    throw error;
  }
};
