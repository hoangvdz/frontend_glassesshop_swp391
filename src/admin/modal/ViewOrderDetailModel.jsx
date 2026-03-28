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
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
    label: "Đang vận chuyển",
    icon: <FiTruck size={13} />,
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
  delivering: {
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

function ViewOrderDetailsModal({ order, onClose, onUpdateStatus, onPrescriptionAction }) {
  const navigate = useNavigate();
  const [adminNotes, setAdminNotes] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  if (!order) return null;

  // Tính toán lại subtotal từ items nếu cần
  const calculatedSubtotal =
    order.orderItems?.reduce((sum, item) => {
      return sum + (item.unitPrice || 0) * (item.quantity || 1);
    }, 0) || 0;

  const currentStatus = (order.status || "pending").toString().toLowerCase().trim();
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  // Kiểm tra đơn hàng có prescription không (Broad + Deep scan)
  const isPrescriptionOrder =
    order.hasPrescription ||
    order.orderItems?.some((item) => {
      // 1. Dựa trên flag hoặc type
      if (
        item.itemType === "PRESCRIPTION" ||
        item.fulfillmentType === "PRESCRIPTION" ||
        item.isLens === true
      )
        return true;
      // 2. Dựa trên sự tồn tại của object prescription
      if (item.prescription != null) return true;
      // 3. Dựa trên thông số mắt nhập tay (OD/OS) hoặc Lens Option (Tròng kính luôn cần đơn)
      const rx = item.prescription || item;
      return (
        rx.sphLeft != null ||
        rx.sphRight != null ||
        rx.cylLeft != null ||
        rx.cylRight != null ||
        rx.addLeft != null ||
        rx.addRight != null ||
        item.lensOptionId != null ||
        item.productName?.toLowerCase().includes("tròng") ||
        item.productName?.toLowerCase().includes("thấu kính")
      );
    });

  console.log(">>> MODAL RENDER (Advanced Detection):", { 
    code: order.orderCode || order.code, 
    isPrescriptionOrder,
    items: order.orderItems?.map(i => ({ name: i.productName, lensId: i.lensOptionId, type: i.fulfillmentType }))
  });

  // Lọc ra các item có prescription data
  const prescriptionItems =
    order.orderItems?.filter(
      (item) => 
        item.itemType === "PRESCRIPTION" || 
        item.prescription != null || 
        item.fulfillmentType === "PRESCRIPTION"
    ) || [];

  const allPrescriptionsApproved = 
    prescriptionItems.length === 0 || 
    prescriptionItems.every(item => item.prescription?.status === true);

  // Nếu là đơn prescription + đang pending + chưa được duyệt toàn bộ → chặn chỉnh sửa status
  const isPrescriptionBlocked =
    isPrescriptionOrder && !allPrescriptionsApproved && currentStatus === "pending";

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
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-gray-800 leading-tight">
                    Chi tiết đơn hàng
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badge}`}
                  >
                    {status.icon} {status.label}
                  </span>
                  {isPrescriptionOrder && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <FiFileText size={11} /> Toa thuốc
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FiHash size={11} /> {order.orderCode || order.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <FiCalendar size={11} />{" "}
                    {new Date(order.orderDate || order.createdAt).toLocaleString("vi-VN")}
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
                  <FiPackage size={12} /> Sản phẩm (
                  {order.orderItems?.length || 0})
                </p>

                <div className="space-y-4">
                  {order.orderItems?.map((item, i) => {
                    const itemName =
                      item.productName ||
                      item.product?.name ||
                      "Sản phẩm không tên";
                    const itemImage =
                      item.imageUrl ||
                      item.product?.imageUrl ||
                      `https://placehold.co/100x100?text=${itemName}`;
                    const itemColor =
                      item.variantColor || item.variant?.color;
                    const itemSize =
                      item.variantSize || item.variant?.frameSize;
                    const itemPrice = item.unitPrice || 0;
                    const isLensItem =
                      item.itemType === "PRESCRIPTION" ||
                      item.prescription != null;

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
                            {(item.isPreorder ||
                              item.type === "PRE_ORDER") && (
                              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                                PRE-ORDER
                              </span>
                            )}
                            {isLensItem && (
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                                CÓ TOA THUỐC
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
                            {(
                              itemPrice * (item.quantity || 1)
                            ).toLocaleString("vi-VN")}{" "}
                            ₫
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hiển thị thông tin toa thuốc cho từng item có prescription */}
                {prescriptionItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FiFileText size={12} /> Thông tin toa thuốc
                    </p>
                    {prescriptionItems.map((item, idx) => {
                      const rx = item.prescription || {};
                      return (
                      <div
                        key={idx}
                        className="bg-indigo-50/50 rounded-xl p-4 mb-3 border border-indigo-100"
                      >
                        <p className="text-xs font-medium text-indigo-700 mb-2">
                          {item.productName || `Sản phẩm ${idx + 1}`}
                        </p>
                        <div className="grid grid-cols-5 gap-1 text-[10px] font-semibold text-gray-400 uppercase text-center mb-1">
                          <div className="text-left">Mắt</div>
                          <div>SPH</div>
                          <div>CYL</div>
                          <div>AXIS</div>
                          <div>ADD</div>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-xs text-center font-mono text-gray-700 mb-1">
                          <div className="text-left font-semibold text-gray-500">
                            Phải (OD)
                          </div>
                          <div>{rx.sphRight ?? "—"}</div>
                          <div>{rx.cylRight ?? "—"}</div>
                          <div>
                            {rx.axisRight != null
                              ? `${rx.axisRight}°`
                              : "—"}
                          </div>
                          <div>{rx.addRight ?? "—"}</div>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-xs text-center font-mono text-gray-700">
                          <div className="text-left font-semibold text-gray-500">
                            Trái (OS)
                          </div>
                          <div>{rx.sphLeft ?? "—"}</div>
                          <div>{rx.cylLeft ?? "—"}</div>
                          <div>
                            {rx.axisLeft != null
                              ? `${rx.axisLeft}°`
                              : "—"}
                          </div>
                          <div>{rx.addLeft ?? "—"}</div>
                        </div>
                        {rx.pd && (
                          <div className="mt-2 text-xs text-gray-500">
                            PD:{" "}
                            <span className="font-semibold text-gray-700 font-mono">
                              {rx.pd} mm
                            </span>
                          </div>
                        )}
                        
                        {/* Admin Action for Prescription (inline) */}
                        {currentStatus === "pending" && rx.status !== true && (
                          <div className="mt-4 pt-4 border-t border-indigo-100/50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Xử lý đơn thuốc này
                            </p>
                            <textarea
                              placeholder="Nhập ghi chú/lý do cho khách hàng (nếu từ chối)..."
                              className="w-full text-xs p-3 rounded-lg border border-indigo-100 bg-white focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all resize-none min-h-[60px]"
                              value={adminNotes[rx.prescriptionId] || ""}
                              onChange={(e) => setAdminNotes(prev => ({ ...prev, [rx.prescriptionId]: e.target.value }))}
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                disabled={actionLoading}
                                onClick={async () => {
                                  setActionLoading(true);
                                  try {
                                    await onPrescriptionAction(rx.prescriptionId, true, adminNotes[rx.prescriptionId]);
                                  } catch (err) { alert("Lỗi khi duyệt đơn thuốc"); }
                                  finally { setActionLoading(false); }
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {actionLoading ? "Đang xử lý..." : "DUYỆT ĐƠN THUỐC"}
                              </button>
                              <button
                                disabled={actionLoading}
                                onClick={async () => {
                                  if (!adminNotes[rx.prescriptionId]) {
                                    alert("Vui lòng nhập lý do từ chối vào ô ghi chú");
                                    return;
                                  }
                                  setActionLoading(true);
                                  try {
                                    await onPrescriptionAction(rx.prescriptionId, false, adminNotes[rx.prescriptionId]);
                                  } catch (err) { alert("Lỗi khi từ chối đơn thuốc"); }
                                  finally { setActionLoading(false); }
                                }}
                                className="flex-1 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-[10px] font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                TỪ CHỐI
                              </button>
                            </div>
                          </div>
                        )}

                        {rx.status === true && (
                          <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
                            <FiCheckCircle size={12} />
                            <span className="text-[10px] font-bold uppercase">Toa thuốc đã được duyệt</span>
                          </div>
                        )}
                        {rx.adminNote && (
                          <div className="mt-2 text-[11px] text-gray-500 italic bg-white/50 p-2 rounded-lg border border-gray-100">
                             Ghi chú: {rx.adminNote}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
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
                  {order.phone && (
                    <p className="text-xs text-gray-500 mt-2">
                      SĐT: {order.phone}
                    </p>
                  )}
                  {order.address && (
                    <p className="text-xs text-gray-500 mt-1">
                      Đ/C: {order.address}
                    </p>
                  )}
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
                        {(
                          order.totalPrice || calculatedSubtotal
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">
                        {order.shippingFee > 0
                          ? `${order.shippingFee.toLocaleString("vi-VN")} ₫`
                          : "Miễn phí"}
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
                        {(
                          order.finalPrice ||
                          order.totalPrice ||
                          calculatedSubtotal
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${status.dot}`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Trạng thái: {status.label}
                    </span>
                  </div>

                  {/* Nếu là đơn PRESCRIPTION + PENDING + CHƯA DUYỆT XONG → chặn, hiện hướng dẫn */}
                  {isPrescriptionBlocked ? (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-start gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl mb-3">
                        <FiAlertCircle
                          size={15}
                          className="text-indigo-500 mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-indigo-700 mb-1">
                            Toa thuốc chưa được duyệt
                          </p>
                          <p className="text-xs text-indigo-600 leading-relaxed">
                            Cần duyệt <strong>tất cả</strong> các đơn thuốc ở phía bên trái trước khi có thể xác nhận đơn hàng này.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Bạn có chắc chắn muốn hủy đơn hàng này?"
                            )
                          ) {
                            onUpdateStatus("cancelled");
                          }
                        }}
                        className="w-full px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        Hủy đơn
                      </button>
                    </div>
                  ) : (
                    /* Actions bình thường cho đơn KHÔNG có prescription hoặc prescription đã duyệt */
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
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn hủy đơn hàng này?"
                              )
                            ) {
                              onUpdateStatus("cancelled");
                            }
                          }}
                          className="px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-2 rounded-lg transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  )}
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
