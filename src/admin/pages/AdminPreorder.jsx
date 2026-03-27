import { useCallback, useMemo, useState, memo, useEffect } from "react";
import {
  getPreorderItemsService,
  getStockVariantById,
} from "../services/preOrderService";
import {
  FiPackage,
  FiUser,
  FiMapPin,
  FiFileText,
  FiCheck,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiClock,
  FiShield,
  FiEye,
  FiX,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiPhone,
  FiMail,
  FiHash,
  FiTruck,
  FiRotateCcw,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { MdEdit } from "react-icons/md";

const STEP_COLORS = {
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-400",
    ring: "ring-gray-200",
    btn: "bg-gray-800 hover:bg-gray-700",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
    btn: "bg-blue-600 hover:bg-blue-700",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
    btn: "bg-violet-600 hover:bg-violet-700",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
    btn: "bg-amber-500 hover:bg-amber-600",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-400",
    ring: "ring-orange-200",
    btn: "bg-orange-500 hover:bg-orange-600",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
    ring: "ring-teal-200",
    btn: "bg-teal-600 hover:bg-teal-700",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    ring: "ring-green-200",
    btn: "bg-green-600 hover:bg-green-700",
  },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const colorOf = (step) => STEP_COLORS[step.color] || STEP_COLORS.gray;

const fmtDate = () => new Date().toLocaleDateString("vi-VN");

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MINI PIPELINE TRACK (in row)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MiniPipeline({ currentStep, cancelled }) {
  return (
    <div className="flex items-center gap-0.5">
      {STEPS.map((s, i) => {
        const done = !cancelled && currentStep > s.id;
        const active = !cancelled && currentStep === s.id;
        const cx = colorOf(s);
        return (
          <div key={s.id} className="flex items-center">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all
              ${
                cancelled && currentStep <= s.id
                  ? "bg-gray-100 border-gray-200 text-gray-300"
                  : done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                      ? `${cx.bg} ${cx.border} ${cx.text} border`
                      : "bg-gray-50 border-gray-200 text-gray-300"
              }`}
              title={s.label}
            >
              {done ? <FiCheck size={9} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-2.5 h-px ${done ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PREORDER ROW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PreorderRow = memo(({ order, onView, checkStock }) => {
  return (
    <tr className="hover:bg-gray-50/50 group">
      {/* ID */}
      <td className="px-5 py-4">
        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg tracking-wider">
          {order.id}
        </span>
      </td>

      {/* Customer */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={order.avatar}
            alt={order.customer}
            className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">
              {order.customer}
            </p>
            <p className="text-xs text-gray-400 truncate">{order.email}</p>
          </div>
        </div>
      </td>

      {/* Items */}
      <td className="px-5 py-4">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-gray-800">{item.name}</p>
            <p className="text-xs text-gray-400">Số lượng: {item.quantity}</p>
          </div>
        ))}
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Preorder
        </span>
      </td>

      {/* Date */}
      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
        {order.createdAt}
      </td>

      {/* Action */}
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <div className="relative group/tip">
            <button
              onClick={() => checkStock(order)}
              className="px-10 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
});
PreorderRow.displayName = "PreorderRow";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function AdminPreorders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [stepFilter, setStepFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 7;
  const mapStatusToStep = (status) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PRESCRIPTION_CHECKED":
        return 2;
      case "IN_PRODUCTION":
        return 3;
      case "QC":
        return 4;
      case "SHIPPING":
        return 5;
      case "DELIVERED":
        return 6;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const fetchPreorder = async () => {
      const data = await getPreorderItemsService();
      const mapped = data.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        id: item.orderCode,
        orderId: item.orderId,

        customer: item.customerName,
        email: item.customerEmail,
        phone: item.phone,
        address: item.address,

        createdAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),

        note: item.note,

        avatar: `https://ui-avatars.com/api/?name=${item.customerName}`,

        items: [
          {
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            img: item.imageUrl || "https://via.placeholder.com/50",
          },
        ],

        step: mapStatusToStep(item.orderStatus),
        cancelled: item.orderStatus === "CANCELLED",

        history: [],
      }));
      console.log(mapped);
      setOrders(mapped); // ✅ FIX Ở ĐÂY
    };

    fetchPreorder();
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const checkStockBeforeConfirm = async (order) => {
    try {
      const stock = await getStockVariantById(order.variantId);

      console.log("Stock:", stock);

      if (!stock || stock.stockQuantity <= 0) {
        showToast("Sản phẩm đã hết hàng!", "error");
        return;
      }

      setViewing(order); // ✅ mở modal nếu còn hàng
    } catch (error) {
      console.error(error);
      showToast("Lỗi kiểm tra tồn kho!", "error");
    }
  };

  /* ── filter ── */
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (stepFilter === "all") return true;
      if (stepFilter === "cancelled") return o.cancelled;
      if (stepFilter === "active") return !o.cancelled && o.step < 6;
      if (stepFilter === "done") return !o.cancelled && o.step === 6;
      return !o.cancelled && String(o.step) === stepFilter;
    });
  }, [orders, search, stepFilter]);

  /* ── pagination ── */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginated = filtered.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const getPagination = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 4) pages.push("...");
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    )
      pages.push(i);
    if (safePage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  /* ── advance step ── */
  const handleAdvance = useCallback(
    (id, note) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const nextStep = o.step + 1;
          const histEntry = { step: nextStep, date: fmtDate(), note };
          return {
            ...o,
            step: nextStep,
            history: [...(o.history || []), histEntry],
          };
        }),
      );
      // update viewing
      setViewing((v) => {
        if (!v || v.id !== id) return v;
        const nextStep = v.step + 1;
        return {
          ...v,
          step: nextStep,
          history: [
            ...(v.history || []),
            { step: nextStep, date: fmtDate(), note },
          ],
        };
      });
      showToast(
        `Đã chuyển sang: ${STEPS[Math.min(orders.find((o) => o.id === id)?.step + 1 || 0, 6)]?.label}`,
      );
    },
    [orders, showToast],
  );

  /* ── cancel ── */
  const handleCancel = useCallback(
    (id) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const histEntry = {
            step: o.step,
            date: fmtDate(),
            note: "Admin đã huỷ đơn.",
          };
          return {
            ...o,
            cancelled: true,
            history: [...(o.history || []), histEntry],
          };
        }),
      );
      setViewing((v) => {
        if (!v || v.id !== id) return v;
        return {
          ...v,
          cancelled: true,
          history: [
            ...(v.history || []),
            { step: v.step, date: fmtDate(), note: "Admin đã huỷ đơn." },
          ],
        };
      });
      showToast("Đã huỷ đơn", "error");
    },
    [showToast],
  );

  const activeFilters = [stepFilter !== "all", search !== ""].filter(
    Boolean,
  ).length;

  return (
    <div className="px-8 pt-6 pb-12 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý đặt trước</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi và xử lý quy trình sản xuất kính theo yêu cầu
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-100 flex-wrap">
          <div className="relative w-72">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Tìm mã đơn, khách hàng..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter size={13} className="text-gray-400" />
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setStepFilter("all");
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Mã đơn
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Sản phẩm
                </th>

                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Ngày đặt
                </th>

                <th className="w-16 px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiPackage
                        size={40}
                        strokeWidth={1.2}
                        className="text-gray-200"
                      />
                      <p className="text-sm text-gray-400">
                        Không tìm thấy đơn đặt trước
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((o) => (
                  <PreorderRow key={o.id} order={o} onView={setViewing} checkStockStock={checkStockBeforeConfirm } />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {paginated.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Hiển thị{" "}
              <span className="font-medium text-gray-600">
                {(safePage - 1) * itemsPerPage + 1}–
                {Math.min(safePage * itemsPerPage, filtered.length)}
              </span>{" "}
              trong{" "}
              <span className="font-medium text-gray-600">
                {filtered.length}
              </span>{" "}
              đơn
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 select-none">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  ←
                </button>
                {getPagination().map((page, i) =>
                  page === "..." ? (
                    <span key={i} className="px-2 text-gray-300 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[34px] px-3 py-1.5 rounded-lg text-sm font-medium
                        ${safePage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewing && (
          <DetailModal
            key={viewing.id}
            order={viewing}
            onClose={() => setViewing(null)}
            onAdvance={handleAdvance}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
              ${toast.type === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white"}`}
          >
            {toast.type === "error" ? <FiX size={14} /> : <FiCheck size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
