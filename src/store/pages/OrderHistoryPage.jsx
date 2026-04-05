import { getReturnRequestByOrderItemApi } from "../api/returnRequestApi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiTruck,
  FiCheckCircle,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";

import { getMyOrders, cancelOrder } from "../services/orderService";
import { addToCartService } from "../services/cartService";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
// Dữ liệu mẫu (Mock Data)

const TABS = [
  { id: "All", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "SHIPPING", label: "Shipping" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [returnMap, setReturnMap] = useState({});
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [buyingAgainId, setBuyingAgainId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
        const map = {};

        for (const order of data) {
          for (const item of order.items || []) {
            try {
              const res = await getReturnRequestByOrderItemApi(
                item.orderItemId,
              );
              map[item.orderItemId] = res.data.data;
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

  const handleBuyAgain = async (order) => {
    try {
      setBuyingAgainId(order.orderId);
      let successCount = 0;
      for (const item of order.items) {
        if (!item.variantId) continue; // safety check

        const payload = {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          isLens: item.lensOptionId != null || item.lensType != null,
          isPreorder: item.isPreorder,
          sphLeft: item.sphLeft,
          sphRight: item.sphRight,
          cylLeft: item.cylLeft,
          cylRight: item.cylRight,
          axisLeft: item.axisLeft,
          axisRight: item.axisRight,
          addLeft: item.addLeft,
          addRight: item.addRight,
          pd: item.pd
        };

        try {
          await addToCartService(payload);
          successCount++;
        } catch (err) {
          console.error("Failed to add item to cart:", err);
        }
      }

      if (successCount > 0) {
        showToast("Order items added to your cart!");
        navigate("/checkout");
      } else {
        showToast("Could not add items to cart. They may be out of stock.", "error");
      }
    } finally {
      setBuyingAgainId(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) => activeTab === "All" || order.status === activeTab,
  );

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
              className={`flex-1 min-w-[120px] py-3 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === tab.id
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
              const firstItem = order.items && order.items[0];
              const returnRequest = firstItem ? returnMap[firstItem.orderItemId] : null;
              const returnStatusInfo = returnRequest
                ? getReturnStatusInfo(returnRequest.status)
                : null;
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

                  {/* Thông tin sản phẩm */}
                  {firstItem && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-100">
                        {firstItem.image ? (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiBox size={24} className="text-stone-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 text-sm md:text-base">
                          {firstItem.name}
                        </p>
                        <p className="text-xs md:text-sm text-stone-500 mt-1">
                          Quantity: {firstItem.quantity}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* THÔNG TIN YÊU CẦU ĐỔI TRẢ */}
                  {returnRequest && (
                    <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-semibold text-stone-800">
                          Return / Exchange Request
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${returnStatusInfo.bg} ${returnStatusInfo.color}`}
                        >
                          {returnStatusInfo.text}
                        </span>
                      </div>

                      {returnRequest.status === "REJECTED" && returnRequest.rejectionReason && (
                        <div className="mt-3 text-sm text-red-600 font-medium">
                          <span className="font-semibold">Reason: </span>
                          {returnRequest.rejectionReason}
                        </div>
                      )}

                      {returnRequest.status === "REJECTED" &&
                        (returnRequest.rejectReason ||
                          returnRequest.rejectedReason ||
                          returnRequest.adminNote ||
                          returnRequest.note) && (
                          <p className="mt-3 text-sm text-red-600 font-medium">
                            <span className="font-semibold">Admin rejection reason:</span>{" "}
                            {returnRequest.rejectReason ||
                              returnRequest.rejectedReason ||
                              returnRequest.adminNote ||
                              returnRequest.note}
                          </p>
                        )}
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
                    {statusInfo.code === 3 && (
                      <>
                        {!returnRequest ? (
                          <Link
                            to={`/return-request?orderItemId=${firstItem.orderItemId}`}
                            className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm"
                          >
                            Return/Exchange Request
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="px-5 py-2.5 bg-stone-100 border border-stone-200 text-stone-500 font-semibold rounded-xl text-sm cursor-not-allowed"
                          >
                            {returnRequest.status === "PENDING" && "Request Submitted"}
                            {returnRequest.status === "APPROVED" && "Approved"}
                            {returnRequest.status === "REJECTED" && "Rejected"}
                            {returnRequest.status === "COMPLETED" && "Completed"}
                          </button>
                        )}

                        {firstItem && (
                          <Link
                            to={`/product/${firstItem.productId}#review-form`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md shadow-blue-500/20"
                          >
                            <FiCheckCircle />
                            Review Product
                          </Link>
                        )}
                      </>
                    )}

                    {/* Đã hủy (Cancelled) */}
                    {statusInfo.code === 4 && (
                      <button
                        onClick={() => handleBuyAgain(order)}
                        disabled={buyingAgainId === order.orderId}
                        className="px-5 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        {buyingAgainId === order.orderId ? (
                          <div className="w-4 h-4 rounded-full border-2 border-stone-400 border-t-stone-600 animate-spin" />
                        ) : (
                          <FiShoppingBag />
                        )}
                        Buy Again
                      </button>
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
