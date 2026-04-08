// import { getReturnRequestByOrderItemApi } from "../api/returnRequestApi";
import { getReturnRequestsByOrderItemApi } from "../api/returnRequestApi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiTruck,
  FiCheckCircle,
  FiShoppingBag,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";

import { getMyOrders, cancelOrder } from "../services/orderService";
import { useToast } from "../../context/ToastContext";
// Dữ liệu mẫu (Mock Data)

const TABS = [
  { id: "All", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "SHIPPING", label: "Shipping" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

const PrescriptionInfoBlock = ({ item }) => {
  if (!item) return null;
  const rx = item.prescription || item;
  
  if (
    rx.sphLeft == null && rx.sphRight == null &&
    rx.cylLeft == null && rx.cylRight == null &&
    rx.addLeft == null && rx.addRight == null &&
    rx.pd == null
  ) {
    return null;
  }

  return (
    <div className="mt-4 bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiFileText size={14} /> Prescription Details
      </p>
      
      <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-indigo-400 uppercase mb-2">
        <div className="text-left">Eye</div>
        <div>SPH</div>
        <div>CYL</div>
        <div>AXIS</div>
        <div>ADD</div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono text-gray-700 mb-2 items-center bg-white border border-indigo-50/50 rounded-lg p-2 shadow-sm shadow-indigo-100/20">
        <div className="text-left font-semibold text-gray-500 font-sans text-[11px]">Right (OD)</div>
        <div>{rx.sphRight ?? "—"}</div>
        <div>{rx.cylRight ?? "—"}</div>
        <div>{rx.axisRight != null ? `${rx.axisRight}°` : "—"}</div>
        <div>{rx.addRight ?? "—"}</div>
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono text-gray-700 items-center bg-white border border-indigo-50/50 rounded-lg p-2 shadow-sm shadow-indigo-100/20">
        <div className="text-left font-semibold text-gray-500 font-sans text-[11px]">Left (OS)</div>
        <div>{rx.sphLeft ?? "—"}</div>
        <div>{rx.cylLeft ?? "—"}</div>
        <div>{rx.axisLeft != null ? `${rx.axisLeft}°` : "—"}</div>
        <div>{rx.addLeft ?? "—"}</div>
      </div>
      
      {rx.pd && (
        <div className="mt-3 pt-3 border-t border-indigo-100/50 text-[11px] text-gray-500 flex items-center gap-2">
          <span className="font-medium text-indigo-700/70">Pupillary Distance (PD):</span>
          <span className="font-bold text-indigo-800 font-mono tracking-wide bg-white px-2 py-0.5 rounded-md border border-indigo-100/50 shadow-sm">{rx.pd} mm</span>
        </div>
      )}
    </div>
  );
};

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [returnMap, setReturnMap] = useState({});
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
        const map = {};

          for (const order of data) {
              for (const item of order.items || []) {
                  try {
                      const res = await getReturnRequestsByOrderItemApi(item.orderItemId);
                      const requests = Array.isArray(res?.data?.data) ? res.data.data : [];

                      if (requests.length > 0) {
                          map[item.orderItemId] = requests[0];
                      }
                  } catch {
                      // nếu chưa có return request thì bỏ qua
                  }
              }
          }

        setReturnMap(map);
      } catch (err) {
        console.error("Fetch orders error:", err);
      }
    };

    fetchOrders();
  }, []);

    const getReturnStatusInfo = (status) => {
        switch (status) {
            case "PENDING":
                return {
                    text: "Pending",
                    color: "text-yellow-600",
                    bg: "bg-yellow-100",
                };
            case "APPROVED":
                return {
                    text: "Approved",
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                };
            case "REJECTED":
                return {
                    text: "Rejected",
                    color: "text-red-600",
                    bg: "bg-red-100",
                };
            case "COMPLETED":
                return {
                    text: "Completed",
                    color: "text-green-600",
                    bg: "bg-green-100",
                };
            default:
                return {
                    text: status,
                    color: "text-stone-600",
                    bg: "bg-stone-100",
                };
        }
    };

  const handleCancelOrder = async (orderId) => {
    const isConfirm = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (isConfirm) {
      try {
        const res = await cancelOrder(orderId);

        if (res.success) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.orderId === orderId
                ? { ...order, status: "CANCELLED" }
                : order,
            ),
          );
          showToast("Order cancelled successfully!");
        }
      } catch (error) {
        console.error("Error when cancel order:", error);
        showToast(
          "Cancellation failed: " +
            (error.response?.data?.message || "System error"),
          "error"
        );
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "SHIPPING":
        return { text: "Shipping", code: 2, color: "text-blue-500" };
      case "PROCESSING":
        return { text: "Processing", code: 1.5, color: "text-blue-500" };
      case "COMPLETED":
        return { text: "Delivered", code: 3, color: "text-green-600" };
      case "CANCELLED":
        return { text: "Cancelled", code: 4, color: "text-red-500" };
      case "PENDING":
      default:
        return { text: "Pending", code: 1, color: "text-stone-500" };
    }
  };

  const filteredOrders = orders.filter(
    (order) => activeTab === "All" || order.status === activeTab,
  );
  const toggleOrderDetail = (orderId) => {
      setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-20 px-6 font-sans">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-6 tracking-tight uppercase">
          Your Orders
        </h1>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-2xl shadow-sm border border-stone-100 mb-8 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── NẾU KHÔNG CÓ ĐƠN HÀNG NÀO TRONG TAB ĐÓ ── */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 py-16 flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
              <FiBox size={32} />
            </div>
            <p className="text-stone-500 font-medium">No orders found.</p>
          </div>
        ) : (
          /* ── DANH SÁCH ĐƠN HÀNG ── */
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order, index) => {
                const statusInfo = getStatusInfo(order.status);
                const isExpanded = expandedOrderId === order.id;
                const itemCount = order.items?.length || 0;
              return (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 transition-shadow hover:shadow-md"
                  style={{
                    animation: `fadeUp 0.4s ease forwards ${index * 0.1}s`,
                    opacity: 0,
                  }}
                >
                  {/* Header Đơn hàng */}
                  <div className="flex justify-between items-start border-b border-stone-100 pb-4 mb-5">
                    <div>
                      <p className="font-bold text-stone-900 text-sm md:text-base tracking-tight">
                        #{order.id}
                      </p>
                      <p className="text-xs md:text-sm text-stone-500 mt-1">
                        Ordered on {order.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold text-sm ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </p>
                      <p className="font-bold text-stone-900 text-base md:text-lg mt-1">
                        {order.total?.toLocaleString("en-US")}₫
                      </p>
                    </div>
                  </div>

                    {/* Preview sản phẩm + nút xem chi tiết */}
                    {order.items?.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-100">
                                        {order.items[0]?.image ? (
                                            <img
                                                src={order.items[0].image}
                                                alt={order.items[0].name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FiBox size={24} className="text-stone-300" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-semibold text-stone-800 text-sm md:text-base">
                                            {order.items[0]?.name}
                                        </p>
                                        <p className="text-xs md:text-sm text-stone-500 mt-1">
                                            {itemCount > 1
                                                ? `and ${itemCount - 1} more product(s)`
                                                : `Quantity: ${order.items[0]?.quantity}`}
                                        </p>
                                    </div>
                                </div>

                                {(itemCount > 1 || order.items[0]?.quantity > 1) && (
                                    <button
                                        onClick={() => toggleOrderDetail(order.id)}
                                        className="px-4 py-2 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
                                    >
                                        {isExpanded ? "Hide detail" : "View detail"}
                                    </button>
                                )}
                            </div>
                            
                            {!isExpanded && <PrescriptionInfoBlock item={order.items[0]} />}
                        </div>
                    )}
                    {/* Detail danh sách sản phẩm */}
                    {isExpanded && (
                        <div className="space-y-4 mb-6">
                            {order.items.map((item) => {
                                const itemReturnRequest = returnMap[item.orderItemId];
                                const itemReturnStatusInfo = itemReturnRequest
                                    ? getReturnStatusInfo(itemReturnRequest.status)
                                    : null;

                                return (
                                    <div
                                        key={item.orderItemId}
                                        className="border border-stone-200 rounded-2xl p-4 bg-stone-50"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-100">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiBox size={24} className="text-stone-300" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-stone-800 text-sm md:text-base">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-stone-500 mt-1">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>

                                            {statusInfo.code === 3 && (
                                                <div className="flex flex-wrap gap-3 md:justify-end">
                                                    {!itemReturnRequest ? (
                                                        <Link
                                                            to={`/return-request?orderItemId=${item.orderItemId}`}
                                                            className="px-4 py-2 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 transition-colors text-sm"
                                                        >
                                                            Return/Exchange
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="px-4 py-2 bg-stone-200 border border-stone-200 text-stone-500 font-semibold rounded-xl text-sm cursor-not-allowed"
                                                        >
                                                            {itemReturnRequest.status === "PENDING" && "Request Submitted"}
                                                            {itemReturnRequest.status === "APPROVED" && "Approved"}
                                                            {itemReturnRequest.status === "REJECTED" && "Rejected"}
                                                            {itemReturnRequest.status === "COMPLETED" && "Completed"}
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={`/product/${item.productId}#review-form`}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        <FiCheckCircle />
                                                        Review
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <PrescriptionInfoBlock item={item} />

                                        {itemReturnRequest && (
                                            <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <p className="text-sm font-semibold text-stone-800">
                                                        Return / Exchange Request
                                                    </p>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${itemReturnStatusInfo.bg} ${itemReturnStatusInfo.color}`}
                                                    >
                                                        {itemReturnStatusInfo.text}
                                                     </span>
                                                </div>

                                                {itemReturnRequest.status === "REJECTED" &&
                                                    (itemReturnRequest.rejectionReason ||
                                                        itemReturnRequest.rejectReason ||
                                                        itemReturnRequest.rejectedReason ||
                                                        itemReturnRequest.adminNote ||
                                                        itemReturnRequest.note) && (
                                                        <p className="mt-3 text-sm text-red-600 font-medium">
                                                            <span className="font-semibold">Reason: </span>
                                                            {itemReturnRequest.rejectionReason ||
                                                                itemReturnRequest.rejectReason ||
                                                                itemReturnRequest.rejectedReason ||
                                                                itemReturnRequest.adminNote ||
                                                                itemReturnRequest.note}
                                                        </p>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                  {/* CÁC NÚT CHỨC NĂNG */}
                  <div className="flex flex-wrap gap-3 justify-end pt-2">
                    {/* Chờ xác nhận (Pending) */}
                    {statusInfo.code === 1 && (
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiAlertCircle /> Cancel Order
                      </button>
                    )}

                    {/* Đang giao & Đang xử lý & Chờ xác nhận (Hiển thị nút theo dõi) */}
                    {(statusInfo.code === 2 ||
                      statusInfo.code === 1.5 ||
                      statusInfo.code === 1) && (
                      <Link
                        to={`/shipping-progress/${order.orderId}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md"
                      >
                        <FiTruck />
                        Track Progress
                      </Link>
                    )}

                    {/* Đã giao (Completed) */}
                      {statusInfo.code === 3 && order.items?.length === 1 && (
                          <>
                              {!returnMap[order.items[0].orderItemId] ? (
                                  <Link
                                      to={`/return-request?orderItemId=${order.items[0].orderItemId}`}
                                      className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm"
                                  >
                                      Return/Exchange Request
                                  </Link>
                              ) : (
                                  <button
                                      disabled
                                      className="px-5 py-2.5 bg-stone-100 border border-stone-200 text-stone-500 font-semibold rounded-xl text-sm cursor-not-allowed"
                                  >
                                      {returnMap[order.items[0].orderItemId]?.status === "PENDING" && "Request Submitted"}
                                      {returnMap[order.items[0].orderItemId]?.status === "APPROVED" && "Approved"}
                                      {returnMap[order.items[0].orderItemId]?.status === "REJECTED" && "Rejected"}
                                      {returnMap[order.items[0].orderItemId]?.status === "COMPLETED" && "Completed"}
                                  </button>
                              )}

                              <Link
                                  to={`/product/${order.items[0].productId}#review-form`}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md shadow-blue-500/20"
                              >
                                  <FiCheckCircle />
                                  Review Product
                              </Link>
                          </>
                      )}

                    {/* Đã hủy (Cancelled) */}
                    {statusInfo.code === 4 && (
                      <Link
                        to="/shop"
                        className="px-5 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiShoppingBag /> Buy Again
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
