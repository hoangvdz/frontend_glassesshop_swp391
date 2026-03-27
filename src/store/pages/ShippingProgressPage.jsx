import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiPackage, FiTruck, FiHome, FiChevronLeft } from "react-icons/fi";
import { getOrderDetails } from "../services/orderService";

function ShippingProgressPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetails(id);
        setOrder(data);
      } catch (err) {
        console.error("Lỗi lấy tiến độ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const steps = [
    {
      id: 0,
      title: "Đã xác nhận",
      icon: <FiCheck size={20} />,
      desc: "Đơn hàng đã được xác nhận",
    },
    {
      id: 1,
      title: "Đang đóng gói",
      icon: <FiPackage size={20} />,
      desc: "Đang chuẩn bị hàng",
    },
    {
      id: 2,
      title: "Đang giao hàng",
      icon: <FiTruck size={20} />,
      desc: "Shipper đang giao hàng",
    },
    {
      id: 3,
      title: "Giao thành công",
      icon: <FiHome size={20} />,
      desc: "Đơn hàng đã được giao",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <p className="text-stone-500 mb-4">Không tìm thấy thông tin đơn hàng</p>
        <Link to="/my-orders" className="text-amber-600 font-medium">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 text-sm font-medium"
        >
          <FiChevronLeft /> Quay lại đơn hàng của tôi
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-100">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Tiến độ giao hàng
              </h1>
              <p className="text-stone-500 mt-1">
                Đơn hàng{" "}
                <span className="font-semibold text-stone-900">#{order.id}</span>{" "}
                • Đặt ngày {order.date}
              </p>
            </div>
            <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100">
              {order.rawStatus}
            </div>
          </div>

          {/* Stepper */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 mt-12 pb-8">
            {/* Đường line kết nối (Màn hình ngang) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] w-[75%] h-1 bg-stone-100 -z-0">
              <div
                className="h-full bg-amber-500 transition-all duration-700 ease-in-out"
                style={{
                  width: `${(order.status / (steps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {steps.map((step) => {
              const isActive = order.status >= step.id;
              const isCurrent = order.status === step.id;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex md:flex-col items-center gap-5 md:gap-4 w-full md:w-1/4"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-left md:text-center">
                    <p
                      className={`font-bold text-sm md:text-base ${
                        isActive ? "text-stone-900" : "text-stone-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 hidden md:block">
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        Hiện tại
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingProgressPage;