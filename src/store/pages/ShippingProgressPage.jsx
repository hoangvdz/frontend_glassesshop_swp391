import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    FiCheck, 
    FiPackage, 
    FiTruck, 
    FiHome, 
    FiChevronLeft, 
    FiShoppingBag, 
    FiUser, 
    FiPhone, 
    FiMail, 
    FiMapPin,
    FiClock,
    FiCalendar
} from "react-icons/fi";
import { getOrderDetails } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

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
        console.error("Error fetching order dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <FiShoppingBag size={40} className="text-slate-200 mb-4" />
        <p className="text-slate-400 font-semibold mb-6">Order not found</p>
        <Link to="/my-orders" className="text-sm font-bold text-blue-600 hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { id: 0, title: "Confirmed", icon: <FiCheck />, desc: "Order confirmed" },
    { id: 1, title: "Packaging", icon: <FiPackage />, desc: "Preparing" },
    { id: 2, title: "Shipping", icon: <FiTruck />, desc: "On the way" },
    { id: 3, title: "Delivered", icon: <FiHome />, desc: "Arrived" },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] pt-24 pb-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Simple Breadcrumb */}
        <Link to="/my-orders" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-xs font-bold uppercase tracking-wider">
            <FiChevronLeft /> Back to Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Content (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Order Summary Header Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400">
                            <FiShoppingBag size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">Order #{order.id}</h1>
                                <StatusBadge status={order.rawStatus} />
                            </div>
                            <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-4 uppercase tracking-tighter">
                                <span><FiCalendar className="inline mr-1" /> {order.date}</span>
                                <span className="text-blue-600 font-bold">• Estimated 3-5 days delivery</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10 pb-4 border-b border-slate-50">Shipping Progress</h2>
                    <div className="relative flex justify-between items-center transition-all">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-slate-100 -z-0">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(order.status / (steps.length - 1)) * 100}%` }}
                                className="h-full bg-blue-500" 
                            />
                        </div>

                        {steps.map((step) => {
                            const isActive = order.status >= step.id;
                            const isCurrent = order.status === step.id;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border border-slate-100 text-slate-300"
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute top-12 mt-1 text-center min-w-[80px]">
                                        <p className={`text-[11px] font-bold ${isActive ? "text-slate-900" : "text-slate-300"}`}>
                                            {step.title}
                                        </p>
                                        {isCurrent && (
                                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter block mt-0.5">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-10" /> {/* Extra space for labels */}
                </div>

                {/* Order Items Table Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-[#fafafa]/50">
                        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Order Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-4 py-4 text-center">Qty</th>
                                    <th className="px-4 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image || "https://placehold.co/100"} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">ID: #{item.variantId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-600">{item.quantity}</td>
                                        <td className="px-4 py-4 text-right text-xs font-semibold text-slate-500">{(item.unitPrice || 0).toLocaleString()}₫</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{(item.total || 0).toLocaleString()}₫</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-8 py-6 bg-[#fafafa]/30 border-t border-slate-100">
                        <div className="flex justify-end">
                            <div className="w-full max-w-[240px] space-y-3">
                                <div className="flex justify-between text-xs font-semibold text-slate-400 font-medium uppercase tracking-tighter">
                                    <span>Sub Total</span>
                                    <span className="text-slate-700">{(order.subTotal || 0).toLocaleString()}₫</span>
                                </div>
                                {order.shippingFee > 0 && (
                                    <div className="flex justify-between text-xs font-semibold text-slate-400 font-medium uppercase tracking-tighter">
                                        <span>Shipping Fee</span>
                                        <span className="text-blue-500 font-bold">+ {(order.shippingFee || 0).toLocaleString()}₫</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-xs font-semibold text-slate-400 font-medium uppercase tracking-tighter">
                                        <span>Discount</span>
                                        <span className="text-emerald-500 font-bold">- {(order.discount || 0).toLocaleString()}₫</span>
                                    </div>
                                )}
                                <div className="h-px bg-slate-100 my-2" />
                                <div className="flex justify-between text-base font-bold text-slate-900 tracking-tight">
                                    <span>Grand Total</span>
                                    <span className="text-blue-600 text-lg">{(order.finalTotal || 0).toLocaleString()}₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Customer Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3 flex items-center justify-between">
                        Contact Info
                        <FiUser className="text-slate-300" />
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FiUser size={14}/></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{order.userName || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FiMail size={14}/></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 max-w-[200px] truncate">{order.userEmail || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FiPhone size={14}/></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">{order.phone || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><FiMapPin size={14}/></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</p>
                                <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">{order.address || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline History */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                    <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3 flex items-center justify-between">
                        Order Events
                        <FiClock className="text-slate-300" />
                    </h3>
                    
                    <div className="space-y-6 relative ml-2">
                        <div className="absolute top-1 bottom-1 left-[5px] w-[1px] bg-slate-100" />
                        
                        <div className="flex gap-4">
                            <div className="relative z-10 w-[11px] h-[11px] rounded-full bg-blue-500 border-2 border-white shadow-sm mt-1" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">Order Confirmed</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase leading-none">{order.date}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="relative z-10 w-[11px] h-[11px] rounded-full bg-slate-100 border-2 border-white mt-1" />
                            <div>
                                <p className="text-xs font-bold text-slate-300 italic uppercase tracking-tighter">Preparing Package</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative z-10 w-[11px] h-[11px] rounded-full bg-slate-100 border-2 border-white mt-1" />
                            <div>
                                <p className="text-xs font-bold text-slate-300 italic uppercase tracking-tighter">Shipper Pickup</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-2.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        Support Center
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
    const isCompleted = status === "Delivered" || status === "Completed";
    const isPending = status === "Pending";
    const isCancelled = status === "Cancelled";

    return (
        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
            isCompleted ? "bg-emerald-50 text-emerald-600" :
            isPending ? "bg-amber-50 text-amber-600" :
            isCancelled ? "bg-red-50 text-red-600" :
            "bg-blue-50 text-blue-600"
        }`}>
            <span className={`w-1 h-1 rounded-full ${
                isCompleted ? "bg-emerald-400" :
                isPending ? "bg-amber-400" :
                isCancelled ? "bg-red-400" :
                "bg-blue-400 animate-pulse"
            }`} />
            {status}
        </span>
    );
}

export default ShippingProgressPage;
