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

function ViewOrderDetailsModal({ order,  onClose }) {
  if (!order) return null;
  console.log(order);

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

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
                    <FiHash size={11} /> {order.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FiCalendar size={11} /> {order.createdAt}
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
                  <FiPackage size={12} /> Sản phẩm ({order.items.length})
                </p>

                <div className="space-y-4">
                  {order.items.map((item, i) => {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={item.imageUrl || item.img}
                          alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.color || ""}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                              x{item.quantity}
                            </span>
                            <span className="text-xs text-gray-400">
                              {(item.unitPrice || 0).toLocaleString("vi-VN")} ₫
                              / sp
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            {(
                              (item.unitPrice || 0) * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            ₫
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
                      src={`https://ui-avatars.com/api/?name=${order.customer || order.email}&background=1c1917&color=fff&bold=true`}
                      alt={order.customer}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {order.customer}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.email}
                      </p>
                    </div>
                  </div>
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
                        {order.total} ₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                      <span className="font-semibold text-gray-700">
                        Tổng cộng
                      </span>
                      <span className="font-bold text-blue-600 text-base">
                        {order.total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {status.label}
                  </span>
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
