import {
  FiX,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPackage,
  FiUser,
  FiHash,
  FiCalendar,
  FiTruck,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    icon: <FiClock size={13} />,
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-400",
  },
  processing: {
    label: "Đang đóng gói",
    icon: <FiPackage size={13} />,
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
    dot: "bg-orange-400",
  },
  shipped: {
    label: "Đang giao",
    icon: <FiTruck size={13} />,
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
  completed: {
    label: "Hoàn thành",
    icon: <FiCheckCircle size={13} />,
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Đã huỷ",
    icon: <FiXCircle size={13} />,
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-400",
  },
};

function ViewOrderDetailsModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  // Tính toán lại subtotal từ items nếu cần
  const calculatedSubtotal = order.orderItems?.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * (item.quantity || 1);
  }, 0) || 0;

  const currentStatus = (order.status || "pending").toLowerCase();
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FiPackage size={17} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-800 leading-tight">
                    Chi tiết đơn hàng
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badge}`}
                  >
                    {status.icon} {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FiHash size={11} /> {order.orderCode || order.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FiCalendar size={11} /> {order.orderDate || order.createdAt}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 divide-x divide-gray-100 min-h-0">
              {/* Left — items */}
              <div className="col-span-3 px-6 py-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <FiPackage size={12} /> Sản phẩm ({order.orderItems?.length || 0})
                </p>

                <div className="space-y-4">
                  {order.orderItems?.map((item, i) => {
                    const itemName = item.productName || item.product?.name || "Sản phẩm không tên";
                    const itemImage = item.imageUrl || item.product?.imageUrl || `https://placehold.co/100x100?text=${itemName}`;
                    const itemColor = item.variantColor || item.variant?.color;
                    const itemSize = item.variantSize || item.variant?.frameSize;
                    const itemPrice = item.unitPrice || 0;
                    
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {itemName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            {itemColor && <span>Màu: {itemColor}</span>}
                            {itemSize && <span>Size: {itemSize}</span>}
                            {(item.isPreorder || item.type === "PRE_ORDER") && (
                              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                                PRE-ORDER
                              </span>
                            )}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                              x{item.quantity}
                            </span>
                            <span className="text-xs text-gray-400">
                              {itemPrice.toLocaleString("vi-VN")} ₫ / sp
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            {(itemPrice * (item.quantity || 1)).toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right — summary */}
              <div className="col-span-2 px-6 py-5 flex flex-col gap-6">
                {/* Customer */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FiUser size={12} /> Khách hàng
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                        src={`https://ui-avatars.com/api/?name=${order.userName || order.customer || order.userEmail || "Guest"}&background=1c1917&color=fff&bold=true`}
                        alt={order.userName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {order.userName || order.customer || "Khách lẻ"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.userEmail || order.email || "N/A"}
                      </p>
                    </div>
                  </div>
                  {order.phone && <p className="text-xs text-gray-500 mt-2">SĐT: {order.phone}</p>}
                  {order.address && <p className="text-xs text-gray-500 mt-1">Đ/C: {order.address}</p>}
                </div>

                {/* Payment */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FiTruck size={12} /> Thanh toán
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="text-gray-700 font-medium">
                        {(order.totalPrice || calculatedSubtotal).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">
                        {order.shippingFee > 0 ? `${order.shippingFee.toLocaleString("vi-VN")} ₫` : "Miễn phí"}
                      </span>
                    </div>
                    {order.voucherDiscount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Giảm giá</span>
                            <span className="text-red-500 font-medium">
                                -{order.voucherDiscount.toLocaleString("vi-VN")} ₫
                            </span>
                        </div>
                    )}
                    <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                      <span className="font-semibold text-gray-700">
                        Tổng cộng
                      </span>
                      <span className="font-bold text-blue-600 text-base">
                        {(order.finalPrice || order.totalPrice || calculatedSubtotal).toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                    <span className="text-sm font-medium text-gray-700">
                      Trạng thái: {status.label}
                    </span>
                  </div>

                  {/* Actions based on status */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    {currentStatus === "pending" && (
                      <button
                        onClick={() => onUpdateStatus("processing")}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        Xác nhận & Đóng gói
                      </button>
                    )}
                    {currentStatus === "processing" && (
                      <button
                        onClick={() => onUpdateStatus("shipped")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        Giao hàng ngay
                      </button>
                    )}
                    {currentStatus === "shipped" && (
                      <button
                        onClick={() => onUpdateStatus("completed")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        Giao hàng thành công
                      </button>
                    )}
                    {["pending", "processing"].includes(currentStatus) && (
                      <button
                        onClick={() => {
                          if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                            onUpdateStatus("cancelled");
                          }
                        }}
                        className="px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ViewOrderDetailsModal;
