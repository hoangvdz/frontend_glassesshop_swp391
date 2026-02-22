import { useState } from "react";
import {
  FiX,
  FiPackage,
  FiImage,
  FiCheck,
  FiTag,
  FiDollarSign,
  FiBox,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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

function EditProductModal({ product, onClose, onUpdate }) {
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

  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, specs: { ...f.specs, [name]: value } }));
  };

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!form.name) e.name = true;
    if (!form.type) e.type = true;
    if (!form.price) e.price = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
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
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  /* ── type-specific specs ── */
  const typeFields = () => {
    switch (form.type) {
      case "kinhmat":
        return (
          <FieldGroup
            title="Thông số kính mát"
            icon={<FiTag size={13} className="text-blue-500" />}
          >
            <Input
              label="Màu tròng"
              name="lensColor"
              value={form.specs?.lensColor || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Chống UV"
              name="uvProtection"
              value={form.specs?.uvProtection || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Polarized"
              name="polarized"
              value={form.specs?.polarized || ""}
              onChange={handleSpecChange}
            />
          </FieldGroup>
        );
      case "gongkinh":
        return (
          <FieldGroup
            title="Thông số gọng kính"
            icon={<FiTag size={13} className="text-blue-500" />}
          >
            <Input
              label="Chất liệu"
              name="frameMaterial"
              value={form.specs?.frameMaterial || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Kích thước"
              name="size"
              value={form.specs?.size || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Màu gọng"
              name="color"
              value={form.specs?.color || ""}
              onChange={handleSpecChange}
            />
          </FieldGroup>
        );
      case "trongkinh":
        return (
          <FieldGroup
            title="Thông số tròng kính"
            icon={<FiTag size={13} className="text-blue-500" />}
          >
            <Input
              label="Chiết suất"
              name="lensIndex"
              value={form.specs?.lensIndex || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Chống ánh sáng xanh"
              name="blueLight"
              value={form.specs?.blueLight || ""}
              onChange={handleSpecChange}
            />
            <Input
              label="Chống UV"
              name="uv"
              value={form.specs?.uv || ""}
              onChange={handleSpecChange}
            />
          </FieldGroup>
        );
      default:
        return null;
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
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
          className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[92vh] relative"
        >
          {/* ── Success overlay ── */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl z-50"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col items-center text-center px-8"
                >
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FiCheck
                      size={26}
                      className="text-green-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-base font-semibold text-gray-800">
                    Cập nhật thành công
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Đang đóng...</p>
                  {/* Progress bar */}
                  <div className="w-40 h-0.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.1, ease: "linear" }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <FiPackage size={17} className="text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 leading-tight">
                  Chỉnh sửa sản phẩm
                </h2>
                <p className="text-xs text-gray-400 truncate max-w-[220px]">
                  {product?.name}
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

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Error banner */}
            <AnimatePresence>
              {hasErrors && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                >
                  Vui lòng điền đầy đủ các trường bắt buộc (*)
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category + type */}
            <FieldGroup
              title="Loại sản phẩm"
              icon={<FiPackage size={13} className="text-amber-500" />}
            >
              <div className="md:col-span-2 grid grid-cols-3 gap-2">
                {[
                  { value: "kinhmat", label: "Kính mát", icon: "🕶️" },
                  { value: "gongkinh", label: "Gọng kính", icon: "👓" },
                  { value: "trongkinh", label: "Tròng kính", icon: "🔍" },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() =>
                      handleChange({
                        target: { name: "type", value: cat.value },
                      })
                    }
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150
                      ${
                        form.type === cat.value
                          ? "border-amber-400 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      } ${errors.type ? "border-red-300" : ""}`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span
                      className={`text-xs font-medium ${form.type === cat.value ? "text-amber-700" : "text-gray-600"}`}
                    >
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </FieldGroup>

            {/* Basic info */}
            <FieldGroup
              title="Thông tin cơ bản *"
              icon={<FiTag size={13} className="text-blue-500" />}
            >
              <Input
                label="Tên sản phẩm *"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="VD: Kính Rayban RB3025"
                error={errors.name}
              />
              <Input
                label="Thương hiệu"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="VD: Rayban"
              />
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">
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
                        handleChange({ target: { name: "gender", value: v } })
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                        ${form.gender === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </FieldGroup>

            {/* Type-specific specs */}
            {typeFields()}

            {/* Business info */}
            <FieldGroup
              title="Thông tin kinh doanh"
              icon={<FiDollarSign size={13} className="text-blue-500" />}
            >
              <Input
                label="Giá bán *"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                suffix="₫"
                error={errors.price}
              />
              <Input
                label="Giá khuyến mãi"
                name="salePrice"
                type="number"
                value={form.salePrice}
                onChange={handleChange}
                placeholder="0"
                suffix="₫"
              />
              <Input
                label="Tồn kho"
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                icon={<FiBox size={13} />}
              />
              <Input
                label="SKU"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="VD: RB-3025-001"
              />
            </FieldGroup>

            {/* Image */}
            <FieldGroup
              title="Hình ảnh"
              icon={<FiImage size={13} className="text-blue-500" />}
            >
              <div className="md:col-span-2 flex items-start gap-4">
                <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <FiImage size={22} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    label="URL hình ảnh"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Nhập URL ảnh để xem preview bên trái
                  </p>
                </div>
              </div>
            </FieldGroup>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <p className="text-xs text-gray-400">* Trường bắt buộc</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <FiCheck size={14} />
                Cập nhật
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── field group ── */
function FieldGroup({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* ── input ── */
function Input({ label, icon, suffix, error, ...props }) {
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
          className={`w-full border rounded-lg text-sm py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white focus:border-transparent transition-shadow
            ${icon ? "pl-9 pr-4" : suffix ? "pl-4 pr-10" : "px-4"}
            ${error ? "border-red-300 bg-red-50 focus:ring-red-400" : "border-gray-200"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">Trường này là bắt buộc</p>
      )}
    </div>
  );
}

export default EditProductModal;
