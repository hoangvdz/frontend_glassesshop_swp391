import { useRef, useState } from "react";
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

function ViewOrderDetailsModal({
  order,
  products = [],
  onClose,
  onUpdateStatus,
}) {
  const prevOrderId = useRef(null);
  const [newStatus, setNewStatus] = useState(order?.status || "");
  const [updated, setUpdated] = useState(false);

  if (order?.id !== prevOrderId.current) {
    prevOrderId.current = order?.id;
    if (order?.status !== newStatus) setNewStatus(order?.status || "");
    setUpdated(false);
  }

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * item.quantity;
  }, 0);

  const total = order.total || subtotal;
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isDirty = newStatus !== order.status;

  const handleUpdate = () => {
    onUpdateStatus(newStatus);
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  };

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
                      src={order.avatar}
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
                        {subtotal.toLocaleString("vi-VN")} ₫
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
                        {total.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status updater — visual pills */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Cập nhật trạng thái
                  </p>
                  <div className="space-y-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const isCurrent = order.status === key;
                      const isSelected = newStatus === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setNewStatus(key);
                            setUpdated(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-150
                            ${
                              isSelected
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`}
                          />
                          <span
                            className={`text-xs font-medium flex-1 ${isSelected ? "text-blue-700" : "text-gray-600"}`}
                          >
                            {cfg.label}
                          </span>
                          {isCurrent && !isSelected && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              Hiện tại
                            </span>
                          )}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <FiCheckCircle size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Confirm button */}
                  <AnimatePresence mode="wait">
                    {updated ? (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="mt-3 flex items-center justify-center gap-1.5 w-full px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium"
                      >
                        <FiCheckCircle size={14} /> Đã cập nhật
                      </motion.div>
                    ) : (
                      <motion.button
                        key="btn"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        disabled={!isDirty}
                        onClick={handleUpdate}
                        className="mt-3 w-full px-4 py-2 text-sm rounded-xl font-medium transition-colors
                          disabled:opacity-40 disabled:pointer-events-none
                          bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Xác nhận cập nhật
                      </motion.button>
                    )}
                  </AnimatePresence>
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
