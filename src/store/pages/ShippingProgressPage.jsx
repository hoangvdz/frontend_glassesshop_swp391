import React from "react";
import { FiCheck, FiPackage, FiTruck, FiHome } from "react-icons/fi";

function ShippingProgressPage() {
  // Mock data trạng thái đơn hàng (Có thể thay bằng dữ liệu từ API sau)
  const orderDetails = {
    id: "FALCON-8899",
    date: "15/10/2026",
    status: 2, // 0: Chờ xác nhận, 1: Đang đóng gói, 2: Đang giao, 3: Đã giao
  };

  const steps = [
    { id: 0, title: "Đã xác nhận", icon: <FiCheck size={20} />, date: "15/10/2026 09:00" },
    { id: 1, title: "Đang đóng gói", icon: <FiPackage size={20} />, date: "15/10/2026 14:30" },
    { id: 2, title: "Đang giao hàng", icon: <FiTruck size={20} />, date: "16/10/2026 08:15" },
    { id: 3, title: "Giao thành công", icon: <FiHome size={20} />, date: "Dự kiến 18/10" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">
          Tiến độ giao hàng
        </h1>
        <p className="text-stone-500 mb-8 pb-6 border-b border-stone-100">
          Đơn hàng <span className="font-semibold text-stone-900">#{orderDetails.id}</span> • Đặt ngày {orderDetails.date}
        </p>

        {/* Stepper */}
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 mt-8">
          {/* Đường line kết nối (Màn hình ngang) */}
          <div className="hidden sm:block absolute top-6 left-0 w-full h-1 bg-stone-100 -z-0">
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${(orderDetails.status / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {steps.map((step, index) => {
            const isActive = orderDetails.status >= step.id;
            return (
              <div key={step.id} className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-3 w-full sm:w-1/4 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-colors ${
                  isActive ? "bg-amber-500 text-white shadow-md" : "bg-stone-100 text-stone-400"
                }`}>
                  {step.icon}
                </div>
                <div className="text-left sm:text-center">
                  <p className={`font-semibold ${isActive ? "text-stone-900" : "text-stone-400"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">{step.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ShippingProgressPage;