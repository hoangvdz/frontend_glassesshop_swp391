import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBox, FiTruck, FiCheckCircle, FiShoppingBag, FiAlertCircle } from "react-icons/fi";

// Dữ liệu mẫu (Mock Data)
const MOCK_ORDERS = [
  {
    id: "FALCON-8899",
    date: "15/10/2026",
    status: "Shipping",
    total: 3500000,
    items: [{ name: "Aviator Polarized Gold", quantity: 1, image: null }]
  },
  {
    id: "FALCON-7722",
    date: "01/09/2026",
    status: "Completed",
    total: 2100000,
    items: [{ name: "Classic Black Square", quantity: 1, image: null }]
  },
  {
    id: "FALCON-6655",
    date: "20/08/2026",
    status: "Cancelled",
    total: 1250000,
    items: [{ name: "Retro Clubmaster", quantity: 1, image: null }]
  }
];

const TABS = [
  { id: "All", label: "Tất cả" },
  { id: "Pending", label: "Chờ xác nhận" },
  { id: "Shipping", label: "Đang giao" },
  { id: "Completed", label: "Đã giao" },
  { id: "Cancelled", label: "Đã hủy" },
];

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    // Lấy đơn hàng thật từ localStorage
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Format lại ID của đơn thật cho đẹp
    const formattedSavedOrders = savedOrders.map(order => ({
      ...order,
      id: order.id.toString().startsWith("FALCON") ? order.id : `FALCON-${order.id.toString().slice(-4)}`
    }));

    // Trộn đơn hàng thật với đơn hàng mẫu
    const combinedOrders = [...formattedSavedOrders, ...MOCK_ORDERS];
    
    setOrders(combinedOrders);
  }, []);

  // Hàm xử lý Hủy Đơn Hàng
  const handleCancelOrder = (orderId) => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?");
    if (isConfirm) {
      // 1. Cập nhật State để UI thay đổi ngay lập tức
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      // 2. Cập nhật lại trong localStorage (để F5 không bị mất đối với đơn thật)
      const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const updatedSavedOrders = savedOrders.map(order => {
        const formattedId = order.id.toString().startsWith("FALCON") 
          ? order.id 
          : `FALCON-${order.id.toString().slice(-4)}`;
        
        if (formattedId === orderId) {
          return { ...order, status: "Cancelled" };
        }
        return order;
      });
      localStorage.setItem("orders", JSON.stringify(updatedSavedOrders));
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "Shipping":
        return { text: "Đang giao hàng", code: 2, color: "text-amber-500" };
      case "Completed":
        return { text: "Giao thành công", code: 3, color: "text-green-600" };
      case "Cancelled":
        return { text: "Đã hủy", code: 4, color: "text-red-500" };
      default: // "Pending"
        return { text: "Chờ xác nhận", code: 1, color: "text-stone-500" };
    }
  };

  const filteredOrders = orders.filter(
    (order) => activeTab === "All" || order.status === activeTab
  );

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-20 px-6 font-sans">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 mb-6 tracking-tight uppercase">
          Đơn hàng của bạn
        </h1>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-2xl shadow-sm border border-stone-100 mb-8 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-md"
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
             <p className="text-stone-500 font-medium">Không có đơn hàng nào.</p>
           </div>
        ) : (
          /* ── DANH SÁCH ĐƠN HÀNG ── */
          <div className="flex flex-col gap-6">
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);
              const firstItem = order.items && order.items[0];

              return (
                <div 
                  key={order.id} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 transition-shadow hover:shadow-md"
                  style={{ animation: `fadeUp 0.4s ease forwards ${index * 0.1}s`, opacity: 0 }}
                >
                  {/* Header Đơn hàng */}
                  <div className="flex justify-between items-start border-b border-stone-100 pb-4 mb-5">
                    <div>
                      <p className="font-bold text-stone-900 text-sm md:text-base tracking-tight">#{order.id}</p>
                      <p className="text-xs md:text-sm text-stone-500 mt-1">Đặt ngày {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${statusInfo.color}`}>
                        {statusInfo.text}
                      </p>
                      <p className="font-bold text-stone-900 text-base md:text-lg mt-1">
                        {order.total?.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>

                  {/* Thông tin sản phẩm */}
                  {firstItem && (
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-stone-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-stone-100">
                        {firstItem.image ? (
                          <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiBox size={24} className="text-stone-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 text-sm md:text-base">{firstItem.name}</p>
                        <p className="text-xs md:text-sm text-stone-500 mt-1">Số lượng: {firstItem.quantity}</p>
                      </div>
                    </div>
                  )}

                  {/* CÁC NÚT CHỨC NĂNG */}
                  <div className="flex flex-wrap gap-3 justify-end pt-2">
                    
                    {/* Chờ xác nhận (Pending) */}
                    {statusInfo.code === 1 && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-5 py-2.5 bg-white border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiAlertCircle /> Hủy đơn hàng
                      </button>
                    )}

                    {/* Đang giao (Shipping) */}
                    {statusInfo.code === 2 && (
                      <Link 
                        to="/shipping-progress"
                        className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors text-sm shadow-md"
                      >
                        <FiTruck />
                        Theo dõi tiến độ
                      </Link>
                    )}

                    {/* Đã giao (Completed) */}
                    {statusInfo.code === 3 && (
                      <>
                        <Link 
                          to="/return-request"
                          className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors text-sm"
                        >
                          Yêu cầu Đổi/Trả
                        </Link>
                        <Link 
                          to="/order-feedback"
                          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors text-sm shadow-md shadow-amber-500/20"
                        >
                          <FiCheckCircle />
                          Đánh giá sản phẩm
                        </Link>
                      </>
                    )}

                    {/* Đã hủy (Cancelled) */}
                    {statusInfo.code === 4 && (
                      <Link 
                        to="/shop"
                        className="px-5 py-2.5 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors text-sm flex items-center gap-2"
                      >
                        <FiShoppingBag /> Mua lại
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