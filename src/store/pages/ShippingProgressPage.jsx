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
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const steps = [
    {
      id: 0,
      title: "Confirmed",
      icon: <FiCheck size={20} />,
      desc: "Order has been confirmed",
    },
    {
      id: 1,
      title: "Packaging",
      icon: <FiPackage size={20} />,
      desc: "Preparing items",
    },
    {
      id: 2,
      title: "Shipping",
      icon: <FiTruck size={20} />,
      desc: "Shipper is delivering",
    },
    {
      id: 3,
      title: "Delivered",
      icon: <FiHome size={20} />,
      desc: "Order has been delivered",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <p className="text-stone-500 mb-4">Order information not found</p>
        <Link to="/my-orders" className="text-blue-600 font-medium">
          Back to list
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
          <FiChevronLeft /> Back to my orders
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-100">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Shipping Progress
              </h1>
              <p className="text-stone-500 mt-1">
                Order{" "}
                <span className="font-semibold text-stone-900">#{order.id}</span>{" "}
                • Ordered on {order.date}
              </p>
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
              {order.rawStatus}
            </div>
          </div>

          {/* Stepper */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 mt-12 pb-8">
            {/* Đường line kết nối (Màn hình ngang) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] w-[75%] h-1 bg-stone-100 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110"
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
                        Current
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