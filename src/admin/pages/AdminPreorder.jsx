import { useCallback, useMemo, useState, memo } from "react";
import { preordersMock, productsMock } from "../data/adminMock";
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PIPELINE DEFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export const STEPS = [
  {
    id: 0,
    key: "placed",
    label: "Đã đặt",
    short: "Đặt hàng",
    icon: <FiPackage size={14} />,
    color: "gray",
    actionLabel: "Xác nhận đơn",
  },
  {
    id: 1,
    key: "confirmed",
    label: "Xác nhận",
    short: "Xác nhận",
    icon: <FiCheck size={14} />,
    color: "blue",
    actionLabel: "Kiểm tra toa mắt",
  },
  {
    id: 2,
    key: "prescription",
    label: "Kiểm tra toa",
    short: "Toa mắt",
    icon: <FiFileText size={14} />,
    color: "violet",
    actionLabel: "Chuyển sản xuất",
  },
  {
    id: 3,
    key: "production",
    label: "Sản xuất",
    short: "Sản xuất",
    icon: <FiClock size={14} />,
    color: "amber",
    actionLabel: "Chuyển kiểm tra QC",
  },
  {
    id: 4,
    key: "qc",
    label: "Kiểm tra QC",
    short: "QC",
    icon: <FiShield size={14} />,
    color: "orange",
    actionLabel: "Giao vận",
  },
  {
    id: 5,
    key: "shipping",
    label: "Đang giao",
    short: "Giao hàng",
    icon: <FiTruck size={14} />,
    color: "teal",
    actionLabel: "Xác nhận đã giao",
  },
  {
    id: 6,
    key: "delivered",
    label: "Hoàn tất",
    short: "Hoàn tất",
    icon: <FiCheck size={14} />,
    color: "green",
    actionLabel: null,
  },
];

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
const getProduct = (id) => productsMock.find((p) => p.id === id);

const calcTotal = (items) =>
  items.reduce((s, i) => {
    const p = getProduct(i.productId);
    return p ? s + p.price * i.quantity : s;
  }, 0);

const stepOf = (id) => STEPS.find((s) => s.id === id) || STEPS[0];
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
const PreorderRow = memo(({ order, onView }) => {
  const step = stepOf(order.step);
  const clr = colorOf(step);
  const total = calcTotal(order.items);

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
        <p className="text-sm text-gray-700">{order.items.length} sản phẩm</p>
        <p className="text-xs text-gray-400 font-semibold">
          {total.toLocaleString("vi-VN")}đ
        </p>
      </td>

      {/* Pipeline */}
      <td className="px-5 py-4">
        <MiniPipeline currentStep={order.step} cancelled={order.cancelled} />
      </td>

      {/* Current step badge */}
      <td className="px-5 py-4">
        {order.cancelled ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Đã huỷ
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${clr.bg} ${clr.text} border ${clr.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${clr.dot}`} />{" "}
            {step.label}
          </span>
        )}
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
              onClick={() => onView(order)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FiEye size={16} />
            </button>
            <span className="pointer-events-none absolute bottom-full mb-1.5 right-0 px-2 py-1 text-[11px] rounded-md bg-gray-800 text-white opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-50">
              Xem & xử lý
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
});
PreorderRow.displayName = "PreorderRow";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DETAIL MODAL — with advance step
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DetailModal({ order, onClose, onAdvance, onCancel }) {
  const [note, setNote] = useState("");
  const [confirming, setConf] = useState(false);
  const step = stepOf(order.step);
  const clr = colorOf(step);
  const total = calcTotal(order.items);
  const canAdv = !order.cancelled && order.step < 6;
  const nextStep = STEPS[order.step + 1];

  const handleAdvance = () => {
    onAdvance(order.id, note || `${step.actionLabel} — bởi admin.`);
    setNote("");
    setConf(false);
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
          className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <FiPackage size={17} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-gray-800">{order.id}</h2>
                  {order.cancelled ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                      Đã huỷ
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${clr.bg} ${clr.text} ${clr.border}`}
                    >
                      {step.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <FiCalendar size={10} /> {order.createdAt}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 divide-x divide-gray-100">
              {/* ── Left: items + pipeline ── */}
              <div className="col-span-3 px-6 py-5 space-y-5">
                {/* Pipeline visual */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Quy trình
                  </p>
                  <div className="relative">
                    {/* vertical line */}
                    <div className="absolute left-3.5 top-4 bottom-4 w-px bg-gray-100" />
                    <div className="space-y-0">
                      {STEPS.map((s) => {
                        const done = !order.cancelled && order.step > s.id;
                        const active = !order.cancelled && order.step === s.id;
                        const future = order.cancelled
                          ? order.step < s.id
                          : order.step < s.id;
                        const cx = colorOf(s);
                        const histEntry = order.history?.find(
                          (h) => h.step === s.id,
                        );
                        return (
                          <div
                            key={s.id}
                            className="flex items-start gap-3 py-2 relative z-10"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border
                              ${
                                done
                                  ? "bg-green-500 border-green-500 text-white"
                                  : active
                                    ? `${cx.bg} border ${cx.border} ${cx.text}`
                                    : "bg-white border-gray-200 text-gray-300"
                              }`}
                            >
                              {done ? <FiCheck size={12} /> : s.icon}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-semibold ${done ? "text-green-700" : active ? "text-gray-800" : "text-gray-400"}`}
                                >
                                  {s.label}
                                </p>
                                {active && !order.cancelled && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${cx.bg} ${cx.text} ${cx.border}`}
                                  >
                                    Hiện tại
                                  </span>
                                )}
                              </div>
                              {histEntry && (
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                  {histEntry.note}
                                </p>
                              )}
                              {histEntry && (
                                <p className="text-[10px] text-gray-300 mt-0.5">
                                  {histEntry.date}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Sản phẩm ({order.items.length})
                  </p>
                  <div className="space-y-3">
                    {order.items.map((item, i) => {
                      const p = getProduct(item.productId);
                      if (!p) return null;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {p.category} · ×{item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                            {(p.price * item.quantity).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-2 border-t border-gray-100 text-sm">
                      <span className="font-semibold text-gray-600">
                        Tổng cộng
                      </span>
                      <span className="font-bold text-gray-900">
                        {total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: customer + action ── */}
              <div className="col-span-2 px-5 py-5 flex flex-col gap-5">
                {/* Customer */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FiUser size={11} /> Khách hàng
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                    <img
                      src={order.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {order.customer}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <FiPhone
                        size={11}
                        className="flex-shrink-0 text-gray-300"
                      />
                      {order.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <FiMapPin
                        size={11}
                        className="flex-shrink-0 text-gray-300 mt-0.5"
                      />
                      <span className="leading-snug">{order.address}</span>
                    </div>
                    {order.rxId && (
                      <div className="flex items-center gap-2">
                        <FiFileText
                          size={11}
                          className="flex-shrink-0 text-gray-300"
                        />
                        <span>
                          Toa:{" "}
                          <span className="font-mono font-bold text-gray-600">
                            {order.rxId}
                          </span>
                        </span>
                      </div>
                    )}
                    {order.deposit > 0 && (
                      <div className="flex items-center gap-2">
                        <FiHash
                          size={11}
                          className="flex-shrink-0 text-gray-300"
                        />
                        <span>
                          Cọc:{" "}
                          <span className="font-semibold text-green-600">
                            {order.deposit.toLocaleString("vi-VN")}đ
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Note */}
                {order.note && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <FiAlertCircle
                      size={13}
                      className="text-amber-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-700 leading-snug">
                      {order.note}
                    </p>
                  </div>
                )}

                {/* ── ADVANCE STEP PANEL ── */}
                {canAdv && !confirming && (
                  <div className="mt-auto">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Hành động
                    </p>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder={`Ghi chú cho bước "${nextStep?.label}"...`}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-gray-50 mb-3"
                    />
                    <button
                      onClick={() => setConf(true)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${colorOf(nextStep || step).btn}`}
                    >
                      <FiArrowRight size={14} />
                      {step.actionLabel}
                    </button>
                    <button
                      onClick={() => onCancel(order.id)}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <FiX size={12} /> Huỷ đơn
                    </button>
                  </div>
                )}

                {/* Confirm prompt */}
                {canAdv && confirming && (
                  <div className="mt-auto bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Xác nhận chuyển bước?
                    </p>
                    <p className="text-xs text-blue-600 mb-4">
                      Chuyển sang: <strong>{nextStep?.label}</strong>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConf(false)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-white transition-colors"
                      >
                        Huỷ bỏ
                      </button>
                      <button
                        onClick={handleAdvance}
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                )}

                {order.cancelled && (
                  <div className="mt-auto flex items-center gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <FiX size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium">
                      Đơn này đã bị huỷ
                    </p>
                  </div>
                )}

                {!order.cancelled && order.step === 6 && (
                  <div className="mt-auto flex items-center gap-2 px-3 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <FiCheck
                      size={14}
                      className="text-green-500 flex-shrink-0"
                    />
                    <p className="text-xs text-green-700 font-medium">
                      Đơn đã hoàn tất giao hàng
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function AdminPreorders() {
  const [orders, setOrders] = useState(preordersMock);
  const [search, setSearch] = useState("");
  const [stepFilter, setStepFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 7;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── stats ── */
  const stats = useMemo(() => {
    const active = orders.filter((o) => !o.cancelled && o.step < 6);
    const completed = orders.filter((o) => !o.cancelled && o.step === 6);
    const cancelled = orders.filter((o) => o.cancelled);
    const needsAction = orders.filter(
      (o) => !o.cancelled && [0, 4].includes(o.step),
    ); // placed or QC done
    return {
      active: active.length,
      completed: completed.length,
      cancelled: cancelled.length,
      needsAction: needsAction.length,
    };
  }, [orders]);

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            icon: <FiClock size={16} className="text-blue-600" />,
            label: "Đang xử lý",
            value: stats.active,
            accent: "bg-blue-50",
          },
          {
            icon: <FiAlertCircle size={16} className="text-amber-500" />,
            label: "Cần hành động",
            value: stats.needsAction,
            accent: "bg-amber-50",
          },
          {
            icon: <FiCheck size={16} className="text-green-600" />,
            label: "Hoàn tất",
            value: stats.completed,
            accent: "bg-green-50",
          },
          {
            icon: <FiX size={16} className="text-red-500" />,
            label: "Đã huỷ",
            value: stats.cancelled,
            accent: "bg-red-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.accent}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-800 leading-tight">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline step filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 flex-wrap">
        {[
          { key: "all", label: "Tất cả", count: orders.length },
          { key: "active", label: "Đang xử lý", count: stats.active },
          ...STEPS.slice(0, 6).map((s) => ({
            key: String(s.id),
            label: s.short,
            count: orders.filter((o) => !o.cancelled && o.step === s.id).length,
          })),
          { key: "done", label: "Hoàn tất", count: stats.completed },
          { key: "cancelled", label: "Đã huỷ", count: stats.cancelled },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setStepFilter(f.key);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all
              ${
                stepFilter === f.key
                  ? "border-blue-400 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${stepFilter === f.key ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-500"}`}
            >
              {f.count}
            </span>
          </button>
        ))}
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
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider min-w-[220px]">
                  Tiến trình
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
                  <PreorderRow key={o.id} order={o} onView={setViewing} />
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
