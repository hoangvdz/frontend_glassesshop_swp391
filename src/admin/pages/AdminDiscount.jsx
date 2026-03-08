import { useCallback, useMemo, useState, memo } from "react";
import { productsMock } from "../data/adminMock";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiTag,
  FiPercent,
  FiCalendar,
  FiClock,
  FiZap,
  FiGift,
  FiCopy,
  FiPause,
  FiPlay,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiShoppingBag,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const TYPE_CFG = {
  percent: {
    label: "Giảm %",
    icon: <FiPercent size={11} />,
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  fixed: {
    label: "Giảm tiền",
    icon: <FiTag size={11} />,
    pill: "bg-violet-50 text-violet-700 border-violet-200",
  },
  freeship: {
    label: "Free ship",
    icon: <FiZap size={11} />,
    pill: "bg-teal-50 text-teal-700 border-teal-200",
  },
  gift: {
    label: "Quà tặng",
    icon: <FiGift size={11} />,
    pill: "bg-pink-50 text-pink-700 border-pink-200",
  },
};

const STATUS_CFG = {
  active: {
    label: "Đang chạy",
    badge: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-500",
  },
  scheduled: {
    label: "Sắp diễn ra",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
  expired: {
    label: "Hết hạn",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-300",
  },
  paused: {
    label: "Tạm dừng",
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    dot: "bg-yellow-400",
  },
};

const APPLY_TO_OPTS = [
  { value: "all", label: "Tất cả sản phẩm" },
  { value: "kinhmat", label: "Kính mát" },
  { value: "gongkinh", label: "Gọng kính" },
  { value: "trongkinh", label: "Tròng kính" },
  { value: "products", label: "Sản phẩm cụ thể" },
];

const SEASON_PRESETS = [
  { label: "🎄 Giáng Sinh", start: "2026-12-20", end: "2026-12-26" },
  { label: "🎆 Tết Nguyên Đán", start: "2027-01-20", end: "2027-02-05" },
  { label: "💕 Valentine", start: "2026-02-10", end: "2026-02-15" },
  { label: "🛍️ Ngày 8/3", start: "2026-03-06", end: "2026-03-09" },
  { label: "🔥 Black Friday", start: "2026-11-25", end: "2026-11-29" },
  { label: "🛒 11.11 Sale", start: "2026-11-10", end: "2026-11-12" },
  { label: "⭐ Sinh Nhật Shop", start: "2026-06-15", end: "2026-06-20" },
  { label: "☀️ Hè Rực Rỡ", start: "2026-06-01", end: "2026-08-31" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
const fmt = (d) => new Date(d).toISOString().split("T")[0];
const today = new Date();

const daysLeft = (end) => Math.ceil((new Date(end) - today) / 86400000);

const calcStatus = (d) => {
  if (d.status === "paused") return "paused";
  const s = new Date(d.startDate),
    e = new Date(d.endDate);
  if (today < s) return "scheduled";
  if (today > e) return "expired";
  return "active";
};

const fmtValue = (type, value) => {
  if (type === "percent") return `−${value}%`;
  if (type === "fixed") return `−${value.toLocaleString("vi-VN")}đ`;
  if (type === "freeship") return "Free ship";
  if (type === "gift") return "Quà tặng";
  return "—";
};

const usagePct = (used, max) =>
  max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

const genCode = (name) =>
  name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7) + Math.floor(Math.random() * 90 + 10);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SEED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SEED = [
  {
    id: "DC-001",
    code: "TET2026",
    name: "Tết Nguyên Đán 2026",
    type: "percent",
    value: 20,
    minOrder: 500000,
    maxUses: 200,
    usedCount: 134,
    startDate: fmt(addDays(today, -5)),
    endDate: fmt(addDays(today, 10)),
    applyTo: "all",
    productIds: [],
    desc: "Ưu đãi chào Xuân mới — giảm 20% mọi đơn hàng.",
    status: "active",
  },
  {
    id: "DC-002",
    code: "VALENTINE25",
    name: "Valentine Sale",
    type: "percent",
    value: 15,
    minOrder: 300000,
    maxUses: 100,
    usedCount: 100,
    startDate: fmt(addDays(today, -20)),
    endDate: fmt(addDays(today, -10)),
    applyTo: "kinhmat",
    productIds: [],
    desc: "Giảm 15% nhân dịp lễ Tình Nhân.",
    status: "expired",
  },
  {
    id: "DC-003",
    code: "FREESHIP50",
    name: "Miễn Phí Vận Chuyển",
    type: "freeship",
    value: 0,
    minOrder: 1000000,
    maxUses: 500,
    usedCount: 88,
    startDate: fmt(addDays(today, -2)),
    endDate: fmt(addDays(today, 28)),
    applyTo: "all",
    productIds: [],
    desc: "Free ship cho đơn từ 1 triệu.",
    status: "active",
  },
  {
    id: "DC-004",
    code: "BLACKFRI26",
    name: "Black Friday 2026",
    type: "percent",
    value: 30,
    minOrder: 800000,
    maxUses: 300,
    usedCount: 0,
    startDate: fmt(addDays(today, 45)),
    endDate: fmt(addDays(today, 49)),
    applyTo: "all",
    productIds: [],
    desc: "Siêu sale cuối năm — giảm đến 30%.",
    status: "scheduled",
  },
  {
    id: "DC-005",
    code: "GONG150K",
    name: "Giảm 150K Gọng Kính",
    type: "fixed",
    value: 150000,
    minOrder: 600000,
    maxUses: 150,
    usedCount: 47,
    startDate: fmt(addDays(today, -7)),
    endDate: fmt(addDays(today, 7)),
    applyTo: "gongkinh",
    productIds: [],
    desc: "Giảm thẳng 150K cho danh mục Gọng kính.",
    status: "active",
  },
  {
    id: "DC-006",
    code: "GIFT83",
    name: "Quà 8/3",
    type: "gift",
    value: 0,
    minOrder: 900000,
    maxUses: 80,
    usedCount: 55,
    startDate: fmt(addDays(today, -1)),
    endDate: fmt(addDays(today, 2)),
    applyTo: "all",
    productIds: [],
    desc: "Tặng hộp quà khi mua sản phẩm dành cho nữ.",
    status: "active",
  },
  {
    id: "DC-007",
    code: "SUMMER10",
    name: "Hè Rực Rỡ",
    type: "percent",
    value: 10,
    minOrder: 400000,
    maxUses: 400,
    usedCount: 221,
    startDate: fmt(addDays(today, -30)),
    endDate: fmt(addDays(today, -15)),
    applyTo: "kinhmat",
    productIds: [],
    desc: "Ưu đãi mùa hè cho dòng kính mát.",
    status: "expired",
  },
  {
    id: "DC-008",
    code: "FLASH25",
    name: "Flash Sale Tạm Dừng",
    type: "percent",
    value: 25,
    minOrder: 700000,
    maxUses: 120,
    usedCount: 30,
    startDate: fmt(addDays(today, -3)),
    endDate: fmt(addDays(today, 5)),
    applyTo: "all",
    productIds: [],
    desc: "Flash sale đang tạm dừng.",
    status: "paused",
  },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EMPTY FORM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const EMPTY = {
  name: "",
  code: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxUses: "",
  startDate: "",
  endDate: "",
  applyTo: "all",
  productIds: [],
  desc: "",
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCOUNT ROW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const DiscountRow = memo(({ d, onEdit, onDelete, onToggle, onCopy }) => {
  const realStatus = calcStatus(d);
  const sc = STATUS_CFG[realStatus] || STATUS_CFG.paused;
  const tc = TYPE_CFG[d.type] || TYPE_CFG.percent;
  const pct = usagePct(d.usedCount, d.maxUses);
  const dl = daysLeft(d.endDate);

  return (
    <tr className="hover:bg-gray-50/50 group">
      {/* Code */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg tracking-wider select-all">
            {d.code}
          </span>
          <button
            onClick={() => onCopy(d.code)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-all"
          >
            <FiCopy size={12} />
          </button>
        </div>
      </td>

      {/* Name */}
      <td className="px-5 py-4 max-w-[180px]">
        <p className="font-semibold text-gray-800 text-sm truncate">{d.name}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{d.desc}</p>
      </td>

      {/* Type */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tc.pill}`}
        >
          {tc.icon} {tc.label}
        </span>
      </td>

      {/* Value */}
      <td className="px-5 py-4">
        <span className="font-bold text-gray-800 text-sm">
          {fmtValue(d.type, d.value)}
        </span>
        {d.minOrder > 0 && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            Đơn tối thiểu {d.minOrder.toLocaleString("vi-VN")}đ
          </p>
        )}
      </td>

      {/* Usage bar */}
      <td className="px-5 py-4 min-w-[130px]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500">
            {d.usedCount}/{d.maxUses}
          </span>
          <span
            className={`font-semibold ${pct >= 90 ? "text-red-500" : pct >= 60 ? "text-amber-500" : "text-gray-400"}`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-blue-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </td>

      {/* Expiry */}
      <td className="px-5 py-4 whitespace-nowrap">
        <p className="text-sm text-gray-600">
          {new Date(d.endDate).toLocaleDateString("vi-VN")}
        </p>
        {realStatus === "active" && dl >= 0 && (
          <p
            className={`text-xs mt-0.5 font-medium ${dl <= 3 ? "text-red-500" : dl <= 7 ? "text-amber-500" : "text-gray-400"}`}
          >
            {dl === 0 ? "Hết hạn hôm nay" : `Còn ${dl} ngày`}
          </p>
        )}
        {realStatus === "scheduled" && (
          <p className="text-xs text-blue-500 mt-0.5 font-medium">
            Bắt đầu {new Date(d.startDate).toLocaleDateString("vi-VN")}
          </p>
        )}
      </td>

      {/* Status */}
      <td className="px-5 py-4 text-center">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.badge}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`}
          />
          {sc.label}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          {/* pause/resume only for active/paused */}
          {(realStatus === "active" || d.status === "paused") && (
            <div className="relative group/tip">
              <button
                onClick={() => onToggle(d.id)}
                className={`p-2 rounded-lg transition-colors ${d.status === "paused" ? "text-green-600 hover:bg-green-50" : "text-amber-500 hover:bg-amber-50"}`}
              >
                {d.status === "paused" ? (
                  <FiPlay size={15} />
                ) : (
                  <FiPause size={15} />
                )}
              </button>
              <span className="pointer-events-none absolute bottom-full mb-1.5 right-0 px-2 py-1 text-[11px] rounded-md bg-gray-800 text-white opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-50">
                {d.status === "paused" ? "Kích hoạt" : "Tạm dừng"}
              </span>
            </div>
          )}
          <div className="relative group/tip">
            <button
              onClick={() => onEdit(d)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FiEdit2 size={15} />
            </button>
            <span className="pointer-events-none absolute bottom-full mb-1.5 right-0 px-2 py-1 text-[11px] rounded-md bg-gray-800 text-white opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sửa
            </span>
          </div>
          <div className="relative group/tip">
            <button
              onClick={() => onDelete(d.id)}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiTrash2 size={15} />
            </button>
            <span className="pointer-events-none absolute bottom-full mb-1.5 right-0 px-2 py-1 text-[11px] rounded-md bg-gray-800 text-white opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-50">
              Xoá
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
});
DiscountRow.displayName = "DiscountRow";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCOUNT FORM MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DiscountModal({ initial, onClose, onSave }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(initial || { ...EMPTY });
  const [prodSearch, setProdSearch] = useState("");
  const [showSeason, setShowSeason] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: false }));
  };

  /* auto-generate code from name */
  const handleNameBlur = () => {
    if (!form.code && form.name) set("code", genCode(form.name));
  };

  const applyPreset = (p) => {
    set("startDate", p.start);
    set("endDate", p.end);
    setShowSeason(false);
  };

  const toggleProd = (id) =>
    set(
      "productIds",
      form.productIds.includes(id)
        ? form.productIds.filter((x) => x !== id)
        : [...form.productIds, id],
    );

  const validate = () => {
    const e = {};
    if (!form.name) e.name = true;
    if (!form.code) e.code = true;
    if (!form.startDate) e.startDate = true;
    if (!form.endDate) e.endDate = true;
    if (form.type !== "freeship" && form.type !== "gift" && !form.value)
      e.value = true;
    if (!form.maxUses) e.maxUses = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || `DC-${Date.now()}`,
      value: Number(form.value) || 0,
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || 0,
      usedCount: form.usedCount || 0,
      status: form.status || "active",
    });
    onClose();
  };

  const filteredProds = useMemo(
    () =>
      productsMock.filter((p) =>
        p.name.toLowerCase().includes(prodSearch.toLowerCase()),
      ),
    [prodSearch],
  );

  const needsValue = form.type !== "freeship" && form.type !== "gift";

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
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiTag size={17} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  {isEdit ? "Chỉnh sửa ưu đãi" : "Tạo ưu đãi mới"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEdit ? form.code : "Điền thông tin ưu đãi"}
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Error banner */}
            <AnimatePresence>
              {Object.values(errors).some(Boolean) && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  <FiAlertCircle size={14} /> Vui lòng điền đầy đủ các trường
                  bắt buộc (*)
                </motion.div>
              )}
            </AnimatePresence>

            {/* Row 1: name + code */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tên ưu đãi *" error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="VD: Tết Nguyên Đán 2026"
                  className={fieldCls(errors.name)}
                />
              </Field>
              <Field label="Mã coupon *" error={errors.code}>
                <div className="relative">
                  <input
                    value={form.code}
                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                    placeholder="VD: TET2026"
                    className={`${fieldCls(errors.code)} font-mono uppercase pr-20`}
                  />
                  <button
                    type="button"
                    onClick={() => form.name && set("code", genCode(form.name))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-700 font-medium px-1.5 py-0.5 hover:bg-blue-50 rounded transition-colors"
                  >
                    Tạo
                  </button>
                </div>
              </Field>
            </div>

            {/* Row 2: type + value */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại ưu đãi">
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={fieldCls()}
                >
                  <option value="percent">Giảm theo %</option>
                  <option value="fixed">Giảm số tiền cố định</option>
                  <option value="freeship">Miễn phí vận chuyển</option>
                  <option value="gift">Quà tặng kèm</option>
                </select>
              </Field>
              {needsValue && (
                <Field
                  label={`Giá trị giảm${form.type === "percent" ? " (%)" : " (₫)"} *`}
                  error={errors.value}
                >
                  <div className="relative">
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) => set("value", e.target.value)}
                      placeholder={
                        form.type === "percent" ? "VD: 20" : "VD: 150000"
                      }
                      className={`${fieldCls(errors.value)} pr-10`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                      {form.type === "percent" ? "%" : "₫"}
                    </span>
                  </div>
                </Field>
              )}
              {!needsValue && (
                <Field label="Ghi chú giá trị">
                  <input
                    value={form.desc}
                    onChange={(e) => set("desc", e.target.value)}
                    placeholder="VD: Quà tặng kèm hộp kính..."
                    className={fieldCls()}
                  />
                </Field>
              )}
            </div>

            {/* Row 3: minOrder + maxUses */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Đơn hàng tối thiểu (₫)">
                <input
                  type="number"
                  value={form.minOrder}
                  onChange={(e) => set("minOrder", e.target.value)}
                  placeholder="0 = không giới hạn"
                  className={fieldCls()}
                />
              </Field>
              <Field label="Số lượt dùng tối đa *" error={errors.maxUses}>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => set("maxUses", e.target.value)}
                  placeholder="VD: 200"
                  className={fieldCls(errors.maxUses)}
                />
              </Field>
            </div>

            {/* Row 4: dates + season preset */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">
                  Thời gian hiệu lực *
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowSeason((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                  >
                    <FiCalendar size={12} /> Lấy nhanh từ dịp lễ
                  </button>
                  <AnimatePresence>
                    {showSeason && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowSeason(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-40 overflow-hidden py-1"
                        >
                          {SEASON_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              onClick={() => applyPreset(p)}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left gap-3"
                            >
                              <span className="text-sm text-gray-700">
                                {p.label}
                              </span>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {new Date(p.start).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                                –
                                {new Date(p.end).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày bắt đầu *" error={errors.startDate}>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className={fieldCls(errors.startDate)}
                  />
                </Field>
                <Field label="Ngày kết thúc *" error={errors.endDate}>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className={fieldCls(errors.endDate)}
                  />
                </Field>
              </div>
            </div>

            {/* Apply to */}
            <Field label="Áp dụng cho">
              <select
                value={form.applyTo}
                onChange={(e) => set("applyTo", e.target.value)}
                className={fieldCls()}
              >
                {APPLY_TO_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Product picker (only if applyTo === "products") */}
            <AnimatePresence>
              {form.applyTo === "products" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Field label="Chọn sản phẩm cụ thể">
                    <div className="relative mb-3">
                      <FiSearch
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={13}
                      />
                      <input
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        placeholder="Tìm sản phẩm..."
                        className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                      />
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                      {filteredProds.map((p) => {
                        const checked = form.productIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${checked ? "bg-blue-50/50" : ""}`}
                          >
                            <div
                              onClick={() => toggleProd(p.id)}
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors
                                ${checked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 hover:border-blue-500"}`}
                            >
                              {checked && <FiCheck size={10} />}
                            </div>
                            <img
                              src={p.img}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 truncate">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {p.price.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {form.productIds.length > 0 && (
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        Đã chọn {form.productIds.length} sản phẩm
                      </p>
                    )}
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            <Field label="Mô tả ưu đãi">
              <textarea
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                rows={2}
                placeholder="Mô tả ngắn về ưu đãi này..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none bg-gray-50 focus:bg-white transition-shadow"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
            <p className="text-xs text-gray-400">* Trường bắt buộc</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
              >
                <FiCheck size={14} /> {isEdit ? "Cập nhật" : "Tạo ưu đãi"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DELETE CONFIRM MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DeleteModal({ name, onClose, onConfirm }) {
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-[360px] shadow-xl"
        >
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <FiTrash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Xoá ưu đãi?</h3>
          <p className="text-sm text-gray-500 mb-6">
            Ưu đãi <span className="font-semibold text-gray-700">"{name}"</span>{" "}
            sẽ bị xoá vĩnh viễn.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Xoá
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS (UI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Field({ label, error, children }) {
  return (
    <div>
      <label
        className={`text-xs font-medium mb-1.5 block ${error ? "text-red-500" : "text-gray-500"}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1">Trường này là bắt buộc</p>
      )}
    </div>
  );
}

const fieldCls = (error) =>
  `w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:outline-none transition-shadow bg-gray-50 focus:bg-white
   ${error ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500"}`;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState(SEED);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 6;

  /* ── toast ── */
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── stats ── */
  const stats = useMemo(() => {
    const live = discounts.filter((d) => calcStatus(d) === "active");
    const totalUsed = discounts.reduce((s, d) => s + d.usedCount, 0);
    const scheduled = discounts.filter(
      (d) => calcStatus(d) === "scheduled",
    ).length;
    const expiringSoon = live.filter((d) => daysLeft(d.endDate) <= 3).length;
    return { active: live.length, totalUsed, scheduled, expiringSoon };
  }, [discounts]);

  /* ── filter ── */
  const filtered = useMemo(() => {
    return discounts.filter((d) => {
      const realStatus = calcStatus(d);
      const matchSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || d.type === typeFilter;
      const matchStatus = statusFilter === "all" || realStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [discounts, search, typeFilter, statusFilter]);

  /* ── pagination ── */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const safePage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
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

  /* ── actions ── */
  const handleSave = useCallback(
    (d) => {
      setDiscounts((prev) =>
        prev.some((x) => x.id === d.id)
          ? prev.map((x) => (x.id === d.id ? d : x))
          : [d, ...prev],
      );
      showToast(editItem ? "Đã cập nhật ưu đãi" : "Đã tạo ưu đãi mới");
      setEditItem(null);
      setShowModal(false);
    },
    [editItem, showToast],
  );

  const handleEdit = useCallback((d) => {
    setEditItem(d);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(() => {
    setDiscounts((prev) => prev.filter((x) => x.id !== deleteItem.id));
    showToast("Đã xoá ưu đãi", "error");
    setDeleteItem(null);
  }, [deleteItem, showToast]);

  const handleToggle = useCallback((id) => {
    setDiscounts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "paused" ? "active" : "paused" }
          : d,
      ),
    );
  }, []);

  const handleCopy = useCallback(
    (code) => {
      navigator.clipboard?.writeText(code).catch(() => {});
      showToast(`Đã sao chép mã "${code}"`);
    },
    [showToast],
  );

  const activeFilters = [
    typeFilter !== "all",
    statusFilter !== "all",
    search !== "",
  ].filter(Boolean).length;

  return (
    <div className="px-8 pt-6 pb-12 bg-gray-50 min-h-full">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý ưu đãi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tạo và quản lý mã giảm giá, coupon theo dịp lễ
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <FiPlus size={15} /> Tạo ưu đãi mới
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FiZap size={16} className="text-green-600" />}
          label="Đang chạy"
          value={stats.active}
          sub={`trong ${discounts.length} ưu đãi`}
          accent="bg-green-50"
        />
        <StatCard
          icon={<FiUsers size={16} className="text-blue-600" />}
          label="Lượt sử dụng"
          value={stats.totalUsed}
          sub="tổng tất cả ưu đãi"
          accent="bg-blue-50"
        />
        <StatCard
          icon={<FiCalendar size={16} className="text-violet-600" />}
          label="Sắp diễn ra"
          value={stats.scheduled}
          sub="chưa bắt đầu"
          accent="bg-violet-50"
        />
        <StatCard
          icon={<FiAlertCircle size={16} className="text-red-500" />}
          label="Sắp hết hạn"
          value={stats.expiringSoon}
          sub="trong 3 ngày tới"
          accent="bg-red-50"
        />
      </div>

      {/* ── Status pill filters ── */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { key: "all", label: "Tất cả", count: discounts.length },
          {
            key: "active",
            label: "Đang chạy",
            count: discounts.filter((d) => calcStatus(d) === "active").length,
          },
          {
            key: "scheduled",
            label: "Sắp diễn ra",
            count: discounts.filter((d) => calcStatus(d) === "scheduled")
              .length,
          },
          {
            key: "paused",
            label: "Tạm dừng",
            count: discounts.filter((d) => d.status === "paused").length,
          },
          {
            key: "expired",
            label: "Hết hạn",
            count: discounts.filter((d) => calcStatus(d) === "expired").length,
          },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setStatusFilter(s.key);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${
                statusFilter === s.key
                  ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            {s.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${statusFilter === s.key ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500"}`}
            >
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table card ── */}
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
              placeholder="Tìm mã, tên ưu đãi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-gray-400">
              <FiFilter size={13} />
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-700"
            >
              <option value="all">Tất cả loại</option>
              <option value="percent">Giảm %</option>
              <option value="fixed">Giảm tiền</option>
              <option value="freeship">Free ship</option>
              <option value="gift">Quà tặng</option>
            </select>
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
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
                  Mã coupon
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Tên ưu đãi
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Loại
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Giá trị
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider w-36">
                  Lượt dùng
                </th>
                <th className="text-left px-5 py-3.5 font-semibold tracking-wider">
                  Hết hạn
                </th>
                <th className="text-center px-5 py-3.5 font-semibold tracking-wider">
                  Trạng thái
                </th>
                <th className="px-5 py-3.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiTag
                        size={40}
                        strokeWidth={1.2}
                        className="text-gray-200"
                      />
                      <p className="text-sm text-gray-400">
                        Không tìm thấy ưu đãi phù hợp
                      </p>
                      {activeFilters > 0 && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setTypeFilter("all");
                            setStatusFilter("all");
                          }}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Xoá bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((d) => (
                  <DiscountRow
                    key={d.id}
                    d={d}
                    onEdit={handleEdit}
                    onDelete={(id) =>
                      setDeleteItem(discounts.find((x) => x.id === id))
                    }
                    onToggle={handleToggle}
                    onCopy={handleCopy}
                  />
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
              ưu đãi
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
                        ${safePage === page ? "bg-amber-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
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

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <DiscountModal
            key="form"
            initial={editItem}
            onClose={() => {
              setShowModal(false);
              setEditItem(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteItem && (
          <DeleteModal
            key="del"
            name={deleteItem.name}
            onClose={() => setDeleteItem(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
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
            {toast.type === "error" ? (
              <FiTrash2 size={14} />
            ) : (
              <FiCheck size={14} />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── StatCard (local) ── */
function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
