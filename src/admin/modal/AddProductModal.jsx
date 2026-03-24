import { useState } from "react";
import {
  FiX,
  FiPackage,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiImage,
  FiTag,
  FiDollarSign,
  FiBox,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { createProduct } from "../services/productService";

/* ── stepper ── */
const STEPS = ["Danh mục", "Chi tiết", "Hoàn thành"];

function Stepper({ step }) {
  const progress = step === 1 ? 0 : step === 2 ? 50 : 100;
  return (
    <div className="px-8 py-5 border-b border-gray-100">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 rounded-full">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${
                    done
                      ? "bg-blue-600 text-white shadow-md"
                      : active
                        ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100"
                        : "bg-white border-2 border-gray-200 text-gray-400"
                  }`}
              >
                {done ? <FiCheck size={16} strokeWidth={3} /> : s}
              </div>
              <span
                className={`text-xs font-medium ${active ? "text-blue-600" : done ? "text-gray-500" : "text-gray-400"}`}
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

/* ── category cards ── */
const CATEGORIES = [
  {
    value: "FRAME",
    label: "Gọng kính",
    desc: "Gọng kính thời trang",
    icon: "👓",
  },
  { value: "LENS", label: "Tròng kính", desc: "Tròng quang học", icon: "🔍" },
  {
    value: "ACCESSORY",
    label: "Phụ kiện",
    desc: "Khăn lau, hộp kính...",
    icon: "🧴",
  },
];

const EMPTY_VARIANT = {
  stock: "",
  frameSize: "",
  color: "",
  material: "",
  image: "",
};

const EMPTY_FORM = {
  type: "",
  name: "",
  brand: "",
  description: "",
  price: "",
  variants: [{ ...EMPTY_VARIANT }],
};

/* ── slide variants ── */
const slide = (dir) => ({
  initial: { opacity: 0, x: dir * 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: dir * -30 },
  transition: { duration: 0.2, ease: "easeOut" },
});

function AddProductModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);

  const go = (n) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  // FIX: added resetForm definition
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCompleted(false);
    setStep(1);
    setDirection(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setForm({ ...EMPTY_FORM, type: value });
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const newVariants = [...f.variants];
      newVariants[index] = { ...newVariants[index], [name]: value };
      return { ...f, variants: newVariants };
    });
  };

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { ...EMPTY_VARIANT }],
    }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.type || !form.price) {
        alert("Nhập thiếu thông tin!");
        return;
      }

      // FIX: pass form directly — productService.createProduct builds the payload
      await createProduct(form);

      setCompleted(true);
      setStep(3);
      onAdd?.();
    } catch (err) {
      console.error("Lỗi tạo sản phẩm:", err);
      alert("Tạo sản phẩm thất bại!");
    }
  };

  const canNext = step === 1 ? !!form.type : !!form.name && !!form.price;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiPackage size={17} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 leading-tight">
                Thêm sản phẩm
              </h2>
              <p className="text-xs text-gray-400">
                Bước {step} / {STEPS.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Stepper */}
        <Stepper step={step} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait" initial={false}>
            {/* Step 1 — Category */}
            {step === 1 && !completed && (
              <motion.div key="step1" {...slide(direction)}>
                <p className="text-sm text-gray-500 mb-5">
                  Chọn loại sản phẩm bạn muốn thêm vào hệ thống.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() =>
                        handleChange({
                          target: { name: "type", value: cat.value },
                        })
                      }
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150
                        ${
                          form.type === cat.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <div className="flex-1">
                        <p
                          className={`font-semibold text-sm ${form.type === cat.value ? "text-blue-700" : "text-gray-800"}`}
                        >
                          {cat.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                      {form.type === cat.value && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <FiCheck
                            size={11}
                            strokeWidth={3}
                            className="text-white"
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Details */}
            {step === 2 && !completed && (
              <motion.div
                key="step2"
                {...slide(direction)}
                className="space-y-6"
              >
                <FieldGroup
                  title="Thông tin cơ bản"
                  icon={<FiTag size={14} className="text-blue-500" />}
                >
                  <Input
                    label="Tên sản phẩm *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="VD: Kính Rayban RB3025"
                  />
                  <Input
                    label="Thương hiệu"
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="VD: Rayban"
                  />
                  <Input
                    label="Mô tả"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </FieldGroup>

                {/* Variants */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Variants</h3>
                  {form.variants.map((v, index) => (
                    <div key={index} className="border p-3 rounded-lg mb-3">
                      <p className="text-xs mb-2 font-semibold">
                        Variant {index + 1}
                      </p>
                      <Input
                        label="Màu sắc"
                        name="color"
                        value={v.color}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                      <Input
                        label="Chất liệu"
                        name="material"
                        value={v.material}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                      <Input
                        label="Kích thước"
                        name="frameSize"
                        value={v.frameSize}
                        onChange={(e) => handleVariantChange(index, e)}
                      />
                      <Input
                        label="URL ảnh"
                        name="image"
                        value={v.image}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="https://..."
                        icon={<FiImage size={13} />}
                      />
                      <Input
                        label="Tồn kho"
                        name="stock"
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(index, e)}
                        placeholder="0"
                        icon={<FiBox size={13} />}
                      />
                      {form.variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(index)}
                          className="text-red-500 text-xs mt-2"
                        >
                          Xoá variant
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addVariant}
                    className="text-blue-600 text-sm"
                  >
                    + Thêm variant
                  </button>
                </div>

                <FieldGroup
                  title="Thông tin kinh doanh"
                  icon={<FiDollarSign size={14} className="text-blue-500" />}
                >
                  <Input
                    label="Giá bán *"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    suffix="₫"
                  />
                </FieldGroup>

                {/* Preview — uses first variant image */}
                {form.variants[0]?.image && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center gap-4 px-4 py-3">
                    <img
                      src={form.variants[0].image}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg border"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {form.name || "Tên sản phẩm"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {form.price
                          ? Number(form.price).toLocaleString("vi-VN") + " ₫"
                          : "Chưa có giá"}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3 — Done */}
            {completed && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <FiCheck
                    size={28}
                    className="text-green-600"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Thêm sản phẩm thành công!
                </h3>
                <p className="text-sm text-gray-400 mb-8">
                  Sản phẩm đã được lưu vào hệ thống.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Thêm sản phẩm khác
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!completed && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div>
              {step > 1 && (
                <button
                  onClick={() => go(step - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-white transition-colors"
                >
                  <FiArrowLeft size={14} /> Quay lại
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 mr-2">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${step === s ? "bg-blue-600" : "bg-gray-300"}`}
                  />
                ))}
              </div>

              {step === 1 && (
                <button
                  disabled={!canNext}
                  onClick={() => go(2)}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Tiếp theo <FiArrowRight size={14} />
                </button>
              )}

              {step === 2 && (
                <button
                  disabled={!canNext}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <FiCheck size={14} /> Hoàn thành
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── field group ── */
function FieldGroup({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* ── input ── */
function Input({ label, icon, suffix, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1.5 block font-medium">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full border border-gray-200 rounded-lg text-sm py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white focus:border-transparent transition-shadow
            ${icon ? "pl-9 pr-4" : suffix ? "pl-4 pr-10" : "px-4"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default AddProductModal;
