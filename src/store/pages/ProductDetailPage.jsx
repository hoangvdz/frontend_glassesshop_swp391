import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiShoppingBag,
  FiHeart,
  FiArrowLeft,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiStar,
  FiEye,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import { formatPrice } from "../utils/formatPrice.js";
import { getProductById } from "../services/productService.js";
import { addToCartService } from "../services/cartService";
import { getReviewsByProduct, createReview } from "../api/reviewApi";
import { historyOrderApi } from "../api/orderApi";

/* ─── Toast ─── */
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-full text-sm font-medium shadow-2xl flex items-center gap-2.5"
      style={{ animation: "slideUp .3s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <FiCheck size={11} strokeWidth={3} />
      </span>
      {message}
    </div>
  );
}

/* ─── Star Rating Display ─── */
function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={size}
          fill={s <= rating ? "#f59e0b" : "none"}
          className={s <= rating ? "text-amber-400" : "text-stone-200"}
        />
      ))}
    </div>
  );
}

/* ─── MAIN ─── */
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wished, setWished] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [token] = useState(localStorage.getItem("token"));
  const [lensOption, setLensOption] = useState(null);
  const [prescription, setPrescription] = useState({
    eyes: {
      right: { sphere: "", cylinder: "", axis: "", add: "" },
      left: { sphere: "", cylinder: "", axis: "", add: "" },
    },
    pd: "",
  });

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [eligibleOrderId, setEligibleOrderId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pData] = await Promise.all([getProductById(id)]);
        setProductData(pData);
        await Promise.all([reloadReviews(), checkReviewEligibility()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInitialData();
  }, [id]);

  const checkReviewEligibility = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setCheckingEligibility(false);
      return;
    }
    try {
      const res = await historyOrderApi();
      const orders = res?.data?.data || res?.data || [];
      const match = orders.find(
        (o) =>
          (o?.status?.toUpperCase() === "DELIVERED" ||
            o?.status?.toUpperCase() === "COMPLETED") &&
          (o?.orderItems || o?.items)?.some(
            (item) =>
              (item.productId || item.product?.productId) === parseInt(id),
          ),
      );
      if (match) setEligibleOrderId(match.orderId || match.id);
    } catch (err) {
      if (err.response?.status !== 403)
        console.error("Eligibility check error:", err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const reloadReviews = async () => {
    try {
      const rData = await getReviewsByProduct(id);
      setReviews(rData?.data?.data || []);
    } catch (err) {
      setReviews([]);
      console.log(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!eligibleOrderId || !newComment.trim()) {
      showToast("Vui lòng nhập nhận xét");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview({
        orderId: eligibleOrderId,
        productId: parseInt(id),
        rating: newRating,
        comment: newComment,
      });
      showToast("Gửi đánh giá thành công!");
      setNewComment("");
      setNewRating(5);
      await reloadReviews();
      setEligibleOrderId(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />
          <p className="text-stone-400 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-stone-50 flex items-center justify-center mb-6 border border-stone-100">
          <FiShoppingBag size={28} className="text-stone-300" />
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-stone-400 text-sm mb-8 max-w-xs leading-relaxed">
          Sản phẩm có thể đã bị gỡ bỏ hoặc ID không chính xác.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-7 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  const product = {
    id: productData.id,
    name: productData.name || "No name",
    price: formatPrice(
      productData.price || productData.variants?.[0]?.price || 0,
    ),
    priceNum: productData.price || productData.variants?.[0]?.price || 0,
    category: productData.category,
    description: productData.description,
    images: productData.variants?.map((v) => v.imageUrl) || [
      "https://placehold.co/500",
    ],
    colors: productData.variants?.map((v) => v.color) || [],
    specs: [
      { label: "Thương hiệu", value: productData.brand },
      { label: "Loại sản phẩm", value: productData.category },
      {
        label: "Tồn kho",
        value: productData.variants?.reduce(
          (sum, v) => sum + v.stockQuantity,
          0,
        ),
      },
      {
        label: "Hỗ trợ độ",
        value: productData.isPrescriptionSupported ? "Có" : "Không",
      },
    ],
  };

  const selectedVariantUI = productData.variants?.[activeColor];
  let stockText = "",
    stockColor = "",
    isOutOfStock = false;
  if (!selectedVariantUI || selectedVariantUI.stockQuantity === 0) {
    stockText = "Hết hàng · Có thể đặt trước";
    stockColor = "text-red-500";
    isOutOfStock = true;
  } else if (selectedVariantUI.stockQuantity <= 20) {
    stockText = `Chỉ còn ${selectedVariantUI.stockQuantity} sản phẩm`;
    stockColor = "text-amber-500";
  } else {
    stockText = `Còn ${selectedVariantUI.stockQuantity} sản phẩm`;
    stockColor = "text-emerald-600";
  }

  const maxStock = selectedVariantUI?.stockQuantity || 0;

  const handleAddToCart = async () => {
    let cart;
    try {
      cart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      cart = [];
    }
    const selectedVariant = productData.variants[activeColor];
    if (!selectedVariant) {
      showToast("Vui lòng chọn màu");
      return;
    }
    const cartItem = {
      productId: productData.id,
      name: productData.name,
      brand: productData.brand,
      price: productData.price,
      quantity,
      variant: selectedVariant,
      isPreOrder: isOutOfStock,
    };
    const idx = cart.findIndex(
      (item) => item.variant?.variantId === selectedVariant.variantId,
    );
    if (idx !== -1) cart[idx].quantity += quantity;
    else cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    try {
      // Prepare prescription payload if manual entry is selected
      const isLens = lensOption === "manual";

      const apiRes = await addToCartService({
        productId: productData.id,
        variantId: selectedVariant.variantId,
        quantity,
        isLens,
        isPreorder: isOutOfStock,
        // Manual entry parameters
        sphLeft: isLens ? parseFloat(prescription.eyes.left.sphere) || 0 : null,
        sphRight: isLens ? parseFloat(prescription.eyes.right.sphere) || 0 : null,
        cylLeft: isLens ? parseFloat(prescription.eyes.left.cylinder) || 0 : null,
        cylRight: isLens ? parseFloat(prescription.eyes.right.cylinder) || 0 : null,
        axisLeft: isLens ? parseInt(prescription.eyes.left.axis) || 0 : null,
        axisRight: isLens ? parseInt(prescription.eyes.right.axis) || 0 : null,
        addLeft: isLens ? parseFloat(prescription.eyes.left.add) || 0 : null,
        addRight: isLens ? parseFloat(prescription.eyes.right.add) || 0 : null,
        pd: isLens ? parseFloat(prescription.pd) || 0 : null,
      });

      if (apiRes) {
        // Save preorder state locally to bypass backend strict API validation rejection (500)
        if (isOutOfStock) {
          try {
            const preorders = JSON.parse(localStorage.getItem("frontend_preorders")) || {};
            preorders[selectedVariant.variantId] = true;
            localStorage.setItem("frontend_preorders", JSON.stringify(preorders));
          } catch(e){}
        }
        showToast(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
      } else {
        showToast("Lỗi khi thêm vào giỏ hàng");
      }
    } catch {
      showToast("Đã lưu vào giỏ hàng cục bộ!");
    }
  };

  const prevImg = () =>
    setActiveImg((p) => (p === 0 ? product.images.length - 1 : p - 1));
  const nextImg = () =>
    setActiveImg((p) => (p === product.images.length - 1 ? 0 : p + 1));

  /* average rating */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes imgIn   { from{opacity:0;transform:scale(1.03)} to{opacity:1;transform:scale(1)} }
        .thumb-ring { box-shadow: 0 0 0 2px #1c1917; }
        .color-pill-active {  background: #1c1917;
  color: #fff;
  border-color: #1c1917;
  box-shadow: 0 0 0 2px rgba(28,25,23,0.2);
  transform: scale(1.05); }
        .color-pill { border: 1.5px solid #e7e5e4; padding: 6px 16px; border-radius: 99px; font-size:13px; font-weight:500; transition: all .15s; cursor:pointer; background: white; color: #44403c; }
        .color-pill:hover { border-color: #a8a29e; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <Toast visible={toast.visible} message={toast.message} />

      <div
        className="min-h-screen bg-white text-stone-800"
        style={{
          fontFamily:
            "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ── Breadcrumb ── */}
        <div className="border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-800 text-sm transition-colors group"
            >
              <FiArrowLeft
                size={15}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Quay lại</span>
            </button>
            <p className="text-[11px] text-stone-300 uppercase tracking-[0.2em] font-medium hidden sm:block">
              {product.category}
            </p>
            <div className="w-16" />
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            {/* ── LEFT: Images ── */}
            <div className="space-y-3" style={{ animation: "fadeIn .5s ease" }}>
              {/* Main image */}
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-stone-50 group border border-stone-100">
                <img
                  key={activeImg}
                  src={product.images[activeImg] || "https://placehold.co/500"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  style={{ animation: "imgIn .35s ease" }}
                />
                {/* Image counter pill */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm font-medium tabular-nums">
                    {activeImg + 1} / {product.images.length}
                  </div>
                )}
                {/* Nav arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-stone-700 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white border border-stone-100"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-stone-700 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:bg-white border border-stone-100"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImg
                          ? "thumb-ring border-stone-900"
                          : "border-stone-100 hover:border-stone-300"
                      }`}
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

              {/* Rating summary — only if there are reviews */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <span className="text-2xl font-semibold text-stone-900 tabular-nums">
                    {avgRating}
                  </span>
                  <div>
                    <StarRow
                      rating={Math.round(parseFloat(avgRating))}
                      size={14}
                    />
                    <p className="text-xs text-stone-400 mt-0.5">
                      {reviews.length} đánh giá
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div
              className="flex flex-col gap-6"
              style={{ animation: "slideUp .5s ease" }}
            >
              {/* Category + name + price */}
              <div className="space-y-2">
                <p className="text-[10px] text-stone-400 tracking-[0.25em] uppercase font-semibold">
                  {product.category}
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 leading-snug tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-bold text-amber-500">
                    {product.price}
                  </span>
                </div>
              </div>

              <div className="h-px bg-stone-100" />

              {/* Description */}
              <p className="text-stone-500 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Color selector */}
              <div>
                <p className="text-[10px] text-stone-400 tracking-[0.2em] uppercase font-semibold mb-3">
                  Màu sắc ·{" "}
                  <span className="text-stone-700 normal-case tracking-normal font-medium">
                    {product.colors[activeColor]}
                  </span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {productData.variants.map((v, i) => (
                    <button
                      key={v.variantId}
                      onClick={() => setActiveColor(i)}
                      className={`color-pill ${i === activeColor ? "color-pill-active" : ""}`}
                    >
                      {v.color}
                    </button>
                  ))}
                </div>
                {selectedVariantUI && (
                  <p
                    className={`mt-2.5 text-xs font-medium flex items-center gap-1.5 ${stockColor}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${isOutOfStock ? "bg-red-400" : selectedVariantUI.stockQuantity <= 20 ? "bg-amber-400" : "bg-emerald-500"}`}
                    />
                    {stockText}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[10px] text-stone-400 tracking-[0.2em] uppercase font-semibold mb-3">
                  Số lượng
                </p>
                <div className="flex items-center border border-stone-200 rounded-full w-fit overflow-hidden bg-stone-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors text-xl font-light select-none"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-stone-900 tabular-nums select-none">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity > maxStock - 1}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors text-xl font-light select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Lens / Frame options */}
              {(product.category === "frame" ||
                product.category?.toLowerCase() === "lens") && (
                <div>
                  {product.category === "frame" && (
                    <FramePurchaseOptions
                      product={product}
                      navigate={navigate}
                    />
                  )}
                  {product.category?.toLowerCase() === "lens" && (
                    <LensPurchaseOptions
                      lensOption={lensOption}
                      setLensOption={setLensOption}
                      prescription={prescription}
                      setPrescription={setPrescription}
                    />
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-amber-500 text-white py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-[0.98] duration-150"
                >
                  <FiShoppingBag size={16} />
                  {isOutOfStock ? "Đặt trước ngay" : "Thêm vào giỏ hàng"}
                </button>
                <button
                  onClick={() => setWished((p) => !p)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all active:scale-95 duration-150 ${
                    wished
                      ? "bg-red-50 border-red-300 text-red-500"
                      : "bg-white border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
                  }`}
                >
                  <FiHeart size={16} className={wished ? "fill-red-500" : ""} />
                </button>
              </div>

              {/* Specs */}
              <div className="h-px bg-stone-100" />
              <div className="grid grid-cols-2 gap-2.5">
                {product.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-100"
                  >
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-1">
                      {spec.label}
                    </p>
                    <p className="text-sm font-semibold text-stone-800">
                      {spec.value ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="border-t border-stone-100 mt-4">
          <div className="max-w-6xl mx-auto px-6 py-14">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  Đánh giá sản phẩm
                </h2>
                <p className="text-stone-400 text-sm mt-1">
                  {reviews.length > 0
                    ? `${reviews.length} nhận xét từ khách hàng`
                    : "Chưa có đánh giá nào"}
                </p>
                {avgRating && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRow
                      rating={Math.round(parseFloat(avgRating))}
                      size={15}
                    />
                    <span className="text-sm font-semibold text-stone-700">
                      {avgRating} / 5
                    </span>
                  </div>
                )}
              </div>

              {/* Write review / login prompt */}
              {token ? (
                eligibleOrderId ? (
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 w-full md:max-w-sm">
                    <p className="text-sm font-semibold text-stone-800 mb-4 flex items-center gap-2">
                      <FiStar
                        className="text-amber-500 fill-amber-500"
                        size={14}
                      />
                      Viết đánh giá của bạn
                    </p>
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="transition-transform active:scale-90"
                          >
                            <FiStar
                              size={20}
                              fill={star <= newRating ? "#f59e0b" : "none"}
                              className={
                                star <= newRating
                                  ? "text-amber-400"
                                  : "text-stone-200"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Chia sẻ trải nghiệm của bạn..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-amber-200 rounded-xl focus:ring-1 focus:ring-amber-400 focus:outline-none min-h-[90px] bg-white resize-none text-stone-700 placeholder:text-stone-300"
                        required
                      />
                      <button
                        disabled={submittingReview}
                        type="submit"
                        className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
                      >
                        {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </form>
                  </div>
                ) : checkingEligibility ? (
                  <div className="bg-stone-50 rounded-2xl px-5 py-4 border border-stone-100 flex items-center gap-2 text-xs text-stone-400">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
                    Đang kiểm tra quyền đánh giá...
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 text-center md:max-w-xs">
                    <p className="text-xs text-stone-400 leading-relaxed italic">
                      Bạn chỉ có thể đánh giá những sản phẩm đã mua và nhận hàng
                      thành công.
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 text-center md:max-w-xs">
                  <p className="text-xs text-stone-500 mb-3">
                    Đăng nhập để đánh giá sản phẩm
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-white bg-stone-900 px-5 py-2 rounded-full text-xs font-medium hover:bg-stone-700 transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              )}
            </div>

            {/* Review cards */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="bg-stone-50 border border-stone-100 rounded-2xl p-5 hover:border-stone-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-600 flex-shrink-0">
                          {review.userName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-800 leading-tight">
                            {review.userName}
                          </p>
                          <StarRow rating={review.rating} size={12} />
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-300 font-medium">
                        {new Date(review.reviewDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                    <p className="text-sm text-stone-500 leading-relaxed pl-12">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-stone-100 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-3 border border-stone-100">
                  <FiStar size={20} className="text-stone-200" />
                </div>
                <p className="text-stone-400 text-sm">
                  Chưa có đánh giá nào cho sản phẩm này
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── CTA Strip ── */}
        <section className="relative overflow-hidden bg-stone-900 py-20">
          <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
          <div className="relative max-w-xl mx-auto text-center px-6 z-10">
            <p className="text-amber-400/70 text-[10px] tracking-[0.35em] uppercase font-semibold mb-4">
              Cần tư vấn thêm?
            </p>
            <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">
              Đặt lịch đo mắt <span className="text-amber-400">miễn phí</span>
            </h2>
            <p className="text-stone-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
              Kỹ thuật viên chuyên nghiệp sẵn sàng tư vấn và đo mắt tại cửa hàng
              gần nhất.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button className="flex items-center justify-center gap-2 px-7 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold text-sm rounded-full transition-all active:scale-95">
                <FiCalendar size={15} />
                Đặt lịch ngay
              </button>
              <button className="flex items-center justify-center gap-2 px-7 py-3 border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-white font-medium text-sm rounded-full transition-all active:scale-95">
                <FiMapPin size={15} />
                Tìm cửa hàng
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ─── Frame purchase options ─── */
function FramePurchaseOptions({ product, navigate }) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => navigate(`/prescription/${product.id}`)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 hover:border-indigo-300 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FiEye size={17} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-indigo-900 text-sm">
              Mua kèm tròng có độ
            </p>
            <p className="text-[11px] text-indigo-400 mt-0.5">
              Cắt kính theo đơn thuốc của bạn
            </p>
          </div>
        </div>
        <FiChevronRight
          size={16}
          className="text-indigo-400 group-hover:translate-x-0.5 transition-transform"
        />
      </button>
      <p className="text-[10px] text-center text-stone-300 uppercase tracking-[0.25em] font-medium">
        — hoặc mua gọng không độ —
      </p>
    </div>
  );
}

/* ─── Lens purchase options ─── */
function LensPurchaseOptions({ lensOption, setLensOption, prescription, setPrescription }) {
  const handleEye = (side, field, value) => {
    setPrescription((prev) => ({
      ...prev,
      eyes: { ...prev.eyes, [side]: { ...prev.eyes[side], [field]: value } },
    }));
  };

  return (
    <div className="space-y-2.5">
      {/* Option 1 — Manual */}
      <button
        onClick={() => setLensOption(lensOption === "manual" ? null : "manual")}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
          lensOption === "manual"
            ? "border-emerald-400 bg-emerald-50"
            : "border-stone-200 hover:border-emerald-300 bg-white"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            lensOption === "manual" ? "bg-emerald-100" : "bg-stone-100"
          }`}
        >
          <FiEye
            size={17}
            className={
              lensOption === "manual" ? "text-emerald-600" : "text-stone-500"
            }
          />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-stone-900">
            Nhập toa thủ công
          </p>
          <p
            className={`text-[11px] mt-0.5 ${lensOption === "manual" ? "text-emerald-600" : "text-stone-400"}`}
          >
            Nhập SPH · CYL · AXIS · ADD · PD
          </p>
        </div>
        <FiChevronDown
          size={15}
          className={`text-stone-300 transition-transform duration-200 ${lensOption === "manual" ? "rotate-180 text-emerald-400" : ""}`}
        />
      </button>

      {/* Prescription form */}
      {lensOption === "manual" && (
        <div
          className="border-2 border-emerald-200 rounded-2xl overflow-hidden bg-white"
          style={{ animation: "slideUp .2s ease" }}
        >
          {/* Eye grid */}
          <div className="px-4 pt-4 pb-2">
            <table
              className="w-full"
              style={{
                tableLayout: "fixed",
                borderCollapse: "separate",
                borderSpacing: "0 6px",
              }}
            >
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wider pb-1 w-[16%]">
                    Mắt
                  </th>
                  {["SPH", "CYL", "AXIS", "ADD"].map((h) => (
                    <th
                      key={h}
                      className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider pb-1 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { side: "right", label: "Mắt P" },
                  { side: "left", label: "Mắt T" },
                ].map(({ side, label }) => (
                  <tr key={side}>
                    <td>
                      <span className="inline-block text-[11px] font-bold text-stone-500 uppercase bg-stone-100 px-2 py-1 rounded-md">
                        {label}
                      </span>
                    </td>
                    {["sphere", "cylinder", "axis", "add"].map((field) => (
                      <td key={field} className="px-1">
                        <input
                          type="number"
                          step={field === "axis" ? "1" : "0.25"}
                          value={prescription.eyes[side][field]}
                          onChange={(e) =>
                            handleEye(side, field, e.target.value)
                          }
                          placeholder="—"
                          className="w-full border border-stone-200 rounded-lg px-1 py-2 text-sm text-center font-mono bg-stone-50 focus:bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PD row */}
          <div className="flex items-center gap-3 px-4 py-3 mt-1 border-t border-stone-100 bg-stone-50">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">
              PD (mm)
            </span>
            <input
              type="number"
              value={prescription.pd}
              onChange={(e) =>
                setPrescription((p) => ({ ...p, pd: e.target.value }))
              }
              placeholder="62"
              className="w-16 border border-stone-200 rounded-lg px-2 py-1.5 text-sm font-mono text-center bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 focus:outline-none transition-all"
            />
            <span className="text-[11px] text-stone-400">
              Khoảng cách đồng tử
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-[10px] text-stone-300 uppercase tracking-[0.2em] font-medium whitespace-nowrap">
          hoặc
        </span>
        <div className="flex-1 h-px bg-stone-100" />
      </div>

      {/* Option 2 — No prescription */}
      <button
        onClick={() =>
          setLensOption(
            lensOption === "no-prescription" ? null : "no-prescription",
          )
        }
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
          lensOption === "no-prescription"
            ? "border-stone-800 bg-stone-900 text-white"
            : "border-stone-200 hover:border-stone-400 bg-white"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            lensOption === "no-prescription" ? "bg-white/10" : "bg-stone-100"
          }`}
        >
          <FiCheck
            size={17}
            className={
              lensOption === "no-prescription" ? "text-white" : "text-stone-500"
            }
            strokeWidth={2.5}
          />
        </div>
        <div>
          <p
            className={`font-semibold text-sm ${lensOption === "no-prescription" ? "text-white" : "text-stone-900"}`}
          >
            Không nhập độ
          </p>
          <p
            className={`text-[11px] mt-0.5 ${lensOption === "no-prescription" ? "text-stone-400" : "text-stone-400"}`}
          >
            Mua kính không độ
          </p>
        </div>
      </button>

      {/* Confirmed label */}
      {lensOption && (
        <p className="text-xs text-stone-400 flex items-center gap-1.5 pl-1">
          <FiCheck size={11} className="text-emerald-500" strokeWidth={3} />
          Đã chọn:{" "}
          <span className="font-semibold text-stone-700">
            {lensOption === "manual" ? "Nhập toa thủ công" : "Kính không độ"}
          </span>
        </p>
      )}
    </div>
  );
}

export default ProductDetailPage;
