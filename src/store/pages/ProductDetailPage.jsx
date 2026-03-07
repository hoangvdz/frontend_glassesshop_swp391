import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import FramePurchaseOptions from "../components/Purchase/FramePurchaseOption";
import LensPurchaseOptions from "../components/Purchase/LensePurchaseOption";
import {
  FiShoppingBag,
  FiHeart,
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

/* ─── mock data (thay bằng API sau) ─── */

import { products, formatPrice } from "../data/shopMock.js";

/* ─── Toast ─── */
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl flex items-center gap-2"
      style={{ animation: "slideUp .3s ease" }}
    >
      <FiCheck size={14} className="text-green-400" /> {message}
    </div>
  );
}

/* ─── MAIN ─── */
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tìm sản phẩm theo id từ URL, fallback về null nếu không tìm thấy
  const raw = products.find((p) => String(p.id) === String(id));

  // Nếu không tìm thấy → về trang shop
  if (!raw) {
    navigate("/shop");
    return null;
  }

  const product = {
    id: raw.id,
    name: raw.name,
    price: formatPrice(raw.price),
    priceNum: raw.price,
    category: raw.category,
    badge: raw.featured ? "Best Seller" : null,
    description:
      raw.description ||
      `${raw.name} — thương hiệu ${raw.brand}. Chất lượng cao, bảo hành chính hãng.`,
    images: raw.images,
    colors: ["Đen Nhám", "Bạc Silver", "Vàng Gold"], // mock, thay bằng raw.colors khi có API
    specs: [
      { label: "Thương hiệu", value: raw.brand },
      { label: "Loại sản phẩm", value: raw.type },
      {
        label: "Tình trạng kho",
        value: raw.stock > 0 ? `Còn ${raw.stock} sản phẩm` : "Hết hàng",
      },
      { label: "Bảo hành", value: "24 tháng" },
    ],
  };

  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const idx = cart.findIndex((item) => item.id === product.id);
    if (idx !== -1) cart[idx].quantity += quantity;
    else
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
  };

  const prevImg = () =>
    setActiveImg((p) => (p === 0 ? product.images.length - 1 : p - 1));
  const nextImg = () =>
    setActiveImg((p) => (p === product.images.length - 1 ? 0 : p + 1));

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .thumb-active { border-color: #1c1917; }
        .color-active { background:#1c1917; color:#fff; border-color:#1c1917; }
      `}</style>

      <Toast visible={toast.visible} message={toast.message} />

      <div
        className="min-h-screen bg-white text-stone-800"
        style={{
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif",
        }}
      >
        {/* ── breadcrumb / back ── */}
        <div className="border-b border-stone-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-800 text-sm transition-colors group"
            >
              <FiArrowLeft
                size={14}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Quay lại
            </button>
          </div>
        </div>

        {/* ── main layout ── */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            {/* ── LEFT: images ── */}
            <div className="space-y-4" style={{ animation: "fadeIn .5s ease" }}>
              {/* Main image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100 group">
                <img
                  key={activeImg}
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{ animation: "fadeIn .4s ease" }}
                />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-stone-900 text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full">
                    {product.badge}
                  </span>
                )}

                {/* Arrow nav — only if >1 image */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "thumb-active" : "border-stone-200 hover:border-stone-400"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: info ── */}
            <div
              className="flex flex-col gap-7"
              style={{ animation: "slideUp .5s ease" }}
            >
              {/* Title + price */}
              <div>
                <p className="text-stone-400 text-[11px] tracking-[0.25em] uppercase font-medium mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight leading-tight mb-3">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold text-amber-500">
                  {product.price}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-stone-100" />

              {/* Description */}
              <p className="text-stone-500 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Colors */}
              <div>
                <p className="text-xs text-stone-400 tracking-[0.2em] uppercase font-medium mb-3">
                  Màu sắc ·{" "}
                  <span className="text-stone-600 normal-case tracking-normal">
                    {product.colors[activeColor]}
                  </span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveColor(i)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        i === activeColor
                          ? "color-active"
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-500"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-xs text-stone-400 tracking-[0.2em] uppercase font-medium mb-3">
                  Số lượng
                </p>
                <div className="flex items-center gap-0 border border-stone-200 rounded-full w-fit overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors text-lg font-light"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-stone-800 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
              </div>

            <div> 
           
              {product.category === "frame" && (
                <FramePurchaseOptions product={product} />
              )} 
              {product.category === "lens" && (
                <LensPurchaseOptions product={product} />
              )} 


            </div>

              {/* CTA buttons — đồng bộ rounded-full với HomePage/ShopPage */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-amber-500 text-white py-3.5 rounded-full text-sm font-medium tracking-wide transition-all active:scale-95 shadow-lg shadow-stone-900/10"
                >
                  <FiShoppingBag size={16} />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => setWished((p) => !p)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all active:scale-95 ${
                    wished
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-stone-200 text-stone-400 hover:border-stone-400"
                  }`}
                >
                  <FiHeart
                    size={16}
                    className={wished ? "fill-red-500 text-red-500" : ""}
                  />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-stone-100" />

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-3">
                {product.specs.map((spec, i) => (
                  <div key={i} className="bg-stone-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium mb-0.5">
                      {spec.label}
                    </p>
                    <p className="text-sm font-medium text-stone-800">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA strip — đồng bộ với HomePage & ShopPage ── */}
        <section className="relative overflow-hidden bg-stone-900 py-20 mt-10">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
          <div className="relative max-w-2xl mx-auto text-center px-6 z-10">
            <p className="text-amber-300 text-[11px] tracking-[0.3em] uppercase font-medium mb-4">
              Cần tư vấn thêm?
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-amber-500 tracking-tight mb-4">
              Đặt lịch đo mắt miễn phí
            </h2>
            <p className="text-stone-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Kỹ thuật viên chuyên nghiệp sẵn sàng tư vấn và đo mắt cho bạn tại
              cửa hàng gần nhất.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-medium text-sm tracking-wide rounded-full transition-all active:scale-95">
                Đặt lịch ngay
              </button>
              <button className="px-7 py-3 border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-white font-medium text-sm tracking-wide rounded-full transition-all active:scale-95">
                Tìm cửa hàng
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ProductDetailPage;
