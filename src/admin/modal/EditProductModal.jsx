import { useState } from "react";
import {
  FiX,
  FiPackage,
  FiCheck,
  FiImage,
  FiTag,
  FiDollarSign,
  FiBox,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   STEPPER  (identical to AddProductModal)
───────────────────────────────────────────── */
const STEPS = ["Danh mục", "Chi tiết", "Hoàn thành"];

function Stepper({ step }) {
  const progress = step === 1 ? 0 : step === 2 ? 50 : 100;
  return (
    <div className="px-8 pt-5 pb-6 border-b border-slate-100">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-5 left-5 right-5 h-px bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {STEPS.map((label, i) => {
          const s = i + 1;
          const done = step > s;
          const active = step === s;
          return (
            <div
              key={s}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                  ${
                    done
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500 border-transparent text-white shadow-lg shadow-blue-200"
                      : active
                        ? "bg-white border-blue-500 text-blue-600 shadow-lg shadow-blue-100 ring-4 ring-blue-50"
                        : "bg-white border-slate-200 text-slate-300"
                  }`}
              >
                {done ? <FiCheck size={15} strokeWidth={3} /> : s}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide uppercase
                  ${active ? "text-blue-600" : done ? "text-slate-400" : "text-slate-300"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CATEGORY CONFIG
───────────────────────────────────────────── */
const CATEGORY_MAP = {
  kinhmat: "Kính mát",
  gongkinh: "Gọng kính",
  trongkinh: "Tròng kính",
};
const REV_CATEGORY_MAP = {
  "Kính mát": "kinhmat",
  "Gọng kính": "gongkinh",
  "Tròng kính": "trongkinh",
};

const CATEGORIES = [
  { value: "kinhmat", label: "Kính mát", emoji: "🕶️", color: "amber" },
  { value: "gongkinh", label: "Gọng kính", emoji: "👓", color: "blue" },
  { value: "trongkinh", label: "Tròng kính", emoji: "🔍", color: "violet" },
];

const CC = {
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    shadow: "shadow-amber-200",
    gradient: "from-amber-400 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    shadow: "shadow-blue-200",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-400",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
    shadow: "shadow-violet-200",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
};

/* ─────────────────────────────────────────────
   SECTION
───────────────────────────────────────────── */
function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-400">{icon}</span>
        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FIELD INPUT  (identical to AddProductModal)
───────────────────────────────────────────── */
function FieldInput({ label, icon, suffix, required, error, ...props }) {
  return (
    <div className="group">
      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
        {label}
        {required && (
          <span className="text-blue-400 normal-case tracking-normal font-semibold">
            *
          </span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full border-2 rounded-xl text-sm py-2.5 bg-white
            text-slate-700 placeholder-slate-300
            focus:outline-none focus:border-blue-400
            hover:border-slate-300 transition-colors
            ${icon ? "pl-9 pr-4" : suffix ? "pl-4 pr-10" : "px-4"}
            ${error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200"}`}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 font-medium">
          Trường này là bắt buộc
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────── */
function EditProductModal({ product, onClose, onUpdate }) {
  // Step 1 is already "done" — we open at step 2
  const [step, setStep] = useState(2);
  const [completed, setCompleted] = useState(false);

  const [form, setForm] = useState(() => ({
    id: product?.id || "",
    type: REV_CATEGORY_MAP[product?.category] || "",
    name: product?.name || "",
    brand: product?.brand || "",
    gender: product?.gender || "unisex",
    price: product?.price ?? "",
    salePrice: product?.salePrice ?? "",
    stock: product?.stock ?? "",
    sku: product?.sku || "",
    image: product?.img || product?.image || "",
    specs: product?.specs || {},
  }));

  const [errors, setErrors] = useState({});

  const activeCat = CATEGORIES.find((c) => c.value === form.type);
  const cc = activeCat ? CC[activeCat.color] : CC.blue;
  const hasErrors = Object.values(errors).some(Boolean);

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, specs: { ...f.specs, [name]: value } }));
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = true;
    if (!form.type) e.type = true;
    if (!form.price) e.price = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onUpdate({
      ...form,
      category: CATEGORY_MAP[form.type] || "",
      img: form.image,
      price: form.price !== "" ? Number(form.price) : 0,
      salePrice: form.salePrice !== "" ? Number(form.salePrice) : null,
      stock: form.stock !== "" ? Number(form.stock) : 0,
    });
    setCompleted(true);
    setStep(3);
  };

  /* ── type-specific spec fields ── */
  const typeFields = () => {
    switch (form.type) {
      case "kinhmat":
        return (
          <Section title="Thông số kính mát" icon={<FiTag size={13} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Màu tròng"
                name="lensColor"
                value={form.specs?.lensColor || ""}
                onChange={handleSpecChange}
                placeholder="VD: Xanh đen, Nâu gradient…"
              />
              <FieldInput
                label="Chống UV"
                name="uvProtection"
                value={form.specs?.uvProtection || ""}
                onChange={handleSpecChange}
                placeholder="VD: UV400"
              />
              <FieldInput
                label="Polarized"
                name="polarized"
                value={form.specs?.polarized || ""}
                onChange={handleSpecChange}
                placeholder="VD: Có / Không"
              />
            </div>
          </Section>
        );
      case "gongkinh":
        return (
          <Section title="Thông số gọng kính" icon={<FiTag size={13} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Chất liệu"
                name="frameMaterial"
                value={form.specs?.frameMaterial || ""}
                onChange={handleSpecChange}
                placeholder="VD: Titanium, Acetate…"
              />
              <FieldInput
                label="Kích thước"
                name="size"
                value={form.specs?.size || ""}
                onChange={handleSpecChange}
                placeholder="VD: 52-18-140"
              />
              <FieldInput
                label="Màu gọng"
                name="color"
                value={form.specs?.color || ""}
                onChange={handleSpecChange}
                placeholder="VD: Đen bóng, Vàng gold…"
              />
            </div>
          </Section>
        );
      case "trongkinh":
        return (
          <Section title="Thông số tròng kính" icon={<FiTag size={13} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldInput
                label="Chiết suất"
                name="lensIndex"
                value={form.specs?.lensIndex || ""}
                onChange={handleSpecChange}
                placeholder="VD: 1.56, 1.67…"
              />
              <FieldInput
                label="Chống ánh sáng xanh"
                name="blueLight"
                value={form.specs?.blueLight || ""}
                onChange={handleSpecChange}
                placeholder="VD: Có / Không"
              />
              <FieldInput
                label="Chống UV"
                name="uv"
                value={form.specs?.uv || ""}
                onChange={handleSpecChange}
                placeholder="VD: UV400"
              />
            </div>
          </Section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white w-full max-w-2xl rounded-3xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          boxShadow:
            "0 30px 70px -15px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${cc.iconBg} flex items-center justify-center shadow-lg ${cc.shadow}`}
            >
              <FiPackage size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-[15px] leading-tight">
                Chỉnh sửa sản phẩm
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Bước {step} / {STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── Stepper — step 1 is pre-completed ── */}
        <Stepper step={step} />

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {/* STEP 2 — edit form */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="px-6 py-6 space-y-7"
              >
                {/* Category badge */}
                {activeCat && (
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cc.badge}`}
                  >
                    {activeCat.emoji} {activeCat.label}
                  </span>
                )}

                {/* Error banner */}
                <AnimatePresence>
                  {hasErrors && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-500 font-medium"
                    >
                      Vui lòng điền đầy đủ các trường bắt buộc (*)
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Basic info */}
                <Section title="Thông tin sản phẩm" icon={<FiTag size={13} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldInput
                      label="Tên sản phẩm"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="VD: Kính Rayban RB3025"
                      required
                      error={errors.name}
                    />
                    <FieldInput
                      label="Thương hiệu"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="VD: Rayban, Oakley…"
                    />
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                        Giới tính
                      </label>
                      <div className="flex gap-2">
                        {[
                          { v: "unisex", l: "Unisex" },
                          { v: "male", l: "Nam" },
                          { v: "female", l: "Nữ" },
                        ].map(({ v, l }) => (
                          <button
                            key={v}
                            onClick={() =>
                              handleChange({
                                target: { name: "gender", value: v },
                              })
                            }
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors
                              ${
                                form.gender === v
                                  ? "border-blue-400 bg-blue-50 text-blue-700"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                              }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Type-specific specs */}
                {typeFields()}

                {/* Pricing */}
                <Section title="Giá bán" icon={<FiDollarSign size={13} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldInput
                      label="Giá bán"
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      suffix="₫"
                      required
                      error={errors.price}
                    />
                    <FieldInput
                      label="Giá khuyến mãi"
                      name="salePrice"
                      type="number"
                      value={form.salePrice}
                      onChange={handleChange}
                      placeholder="0"
                      suffix="₫"
                    />
                  </div>
                </Section>

                {/* Stock & SKU */}
                <Section title="Kho hàng" icon={<FiBox size={13} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldInput
                      label="Tồn kho"
                      name="stock"
                      type="number"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      icon={<FiBox size={12} />}
                    />
                    <FieldInput
                      label="SKU"
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="VD: RB-3025-001"
                    />
                  </div>
                </Section>

                {/* Image */}
                <Section title="Hình ảnh" icon={<FiImage size={13} />}>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-2xl border-2 border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <FiImage size={22} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <FieldInput
                        label="URL hình ảnh"
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://…"
                        icon={<FiImage size={12} />}
                      />
                      <p className="text-xs text-slate-400 mt-1.5 font-medium">
                        Nhập URL ảnh để xem preview bên trái
                      </p>
                    </div>
                  </div>
                </Section>
              </motion.div>
            )}

            {/* STEP 3 — done (identical to AddProductModal) */}
            {completed && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center text-center py-16 px-8"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
                    <FiCheck
                      size={34}
                      className="text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-md text-sm">
                    ✨
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                  Cập nhật thành công!
                </h3>
                <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
                  Sản phẩm đã được lưu vào hệ thống.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ── */}
        {!completed && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
            <p className="text-xs text-slate-400 font-medium">
              * Trường bắt buộc
            </p>
            <div className="flex items-center gap-4">
              {/* Dot indicators — same as AddProductModal */}
              <div className="flex gap-1.5">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`rounded-full transition-all duration-300 ${step === s ? "w-5 h-2 bg-blue-500" : "w-2 h-2 bg-slate-200"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-500 border-2 border-slate-200 rounded-xl hover:bg-white transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleSubmit}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-opacity shadow-md ${cc.shadow} bg-gradient-to-r ${cc.gradient} hover:opacity-90`}
                >
                  <FiCheck size={13} strokeWidth={3} />
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EditProductModal;
