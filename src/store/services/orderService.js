import { historyOrderApi } from "../api/orderApi";

// map status backend → frontend
const mapStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "SHIPPING":
      return "Shipping";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Pending";
  }
};

export const getMyOrders = async () => {
  const res = await historyOrderApi();

  const rawOrders = res.data.data;

  // transform data cho UI
  return rawOrders.map((order) => ({
    id: order.orderCode,
    date: new Date(order.orderDate).toLocaleDateString("vi-VN"),
    status: mapStatus(order.status),
    total: order.finalPrice,

    items: order.orderItems.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      image: item.imageUrl,
    })),
  }));
};
