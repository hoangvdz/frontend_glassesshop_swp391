import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingBag,
  FiX,
  FiLock,
  FiCheck,
  FiChevronDown,
  FiArrowRight,
  FiSliders,
} from "react-icons/fi";
// API
import { getAllProducts } from "../services/productService";

const CATEGORIES = ["All", "frame", "lens", "accessory"];

// Label hiển thị đẹp hơn cho từng category
const CATEGORY_LABELS = {
  All: "Tất cả",
  frame: "Gọng kính",
  lens: "Tròng kính",
  accessory: "Phụ kiện",
};

const SORT_OPTIONS = [
  { label: "Mặc định", value: "default" },
  { label: "Giá thấp → cao", value: "asc" },
  { label: "Giá cao → thấp", value: "desc" },
];

/* LoginModal — identical to HomePage */
function LoginModal({ isOpen, onClose, productName }) {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: "fadeIn .2s ease" }}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl"
        style={{ animation: "slideUp .3s cubic-bezier(.34,1.56,.64,1)" }}
      >
        <div className="h-0.5 w-full bg-blue-600" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
        >
          <FiX size={16} />
        </button>
        <div className="px-8 pt-8 pb-10">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <FiLock size={18} className="text-blue-600" />
          </div>
          <div className="text-center mb-7">
            <h3 className="text-lg font-semibold text-stone-900 mb-2 tracking-tight">
              Đăng nhập để tiếp tục
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              {productName ? (
                <>
                  Bạn cần đăng nhập để xem chi tiết sản phẩm{" "}
                  <span className="font-medium text-stone-700">
                    "{productName}"
                  </span>{" "}
                </>
              ) : (
                "Vui lòng đăng nhập để xem chi tiết sản phẩm."
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                // FIX LỖI: Sử dụng window.location.pathname thay vì location trống
                navigate("/login", { state: { from: window.location.pathname } });
              }}
              className="w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all text-sm tracking-wide active:scale-95"
            >
              Login
            </button>
            <button
              onClick={() => {
                onClose();
                navigate("/register");
              }}
              className="w-full py-3 border border-stone-200 cursor-pointer hover:border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-xl transition-all text-sm tracking-wide active:scale-95"
            >
              Create Account
            </button>
          </div>
          <p className="text-center text-xs text-stone-400 mt-5">
            <button
              onClick={onClose}
              className="hover:text-stone-700 transition-colors cursor-pointer"
            >
              Tiếp tục xem sản phẩm
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* Toast — identical to HomePage */
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-5 py-3 rounded-full text-sm font-medium shadow-xl flex items-center gap-2"
      style={{ animation: "slideUp .3s ease" }}
    >
      <FiCheck size={14} className="text-green-400" /> {message}
    </div>
  );
}

/* ─── MAIN ─── */
function ShopPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [visible, setVisible] = useState({});
  const sortRef = useRef(null);

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  
  // CALL API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();

        // FIX LỖI: Ánh xạ đúng dữ liệu từ Backend trả về để không bị mất ảnh hoặc category
        const mapped = data.map((p) => {
          const finalPrice = p.price || p.variants?.[0]?.price || 0;
          const finalImg = p.img || p.imageUrl || p.variants?.[0]?.imageUrl || "https://via.placeholder.com/500";
          const finalCategory = (p.category || p.productType || "frame").toLowerCase();

          return {
            id: p.id || p.productId,
            name: p.name,
            price: finalPrice.toLocaleString("en-US") + " VND",
            priceNum: finalPrice,
            category: finalCategory,
            brand: p.brand,
            img: finalImg,
          };
        });
        
        setProducts(mapped);
      } catch (err) {
        console.error("Fetch products error:", err);
      }
    };

    fetchProducts();
  }, []);

  //API VIEW
  useEffect(() => {
    const fn = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting)
            setVisible((p) => ({ ...p, [e.target.id]: true }));
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll("[data-card]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  });

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!localStorage.getItem("currentUser") && !localStorage.getItem("token")) {
      setPendingProduct(product);
      setModalOpen(true);
      return;
    }

    navigate(`/product/${product.id}`);
  };

  const handleProductClick = (e) => {
    if (!localStorage.getItem("currentUser") && !localStorage.getItem("token")) {
      e.preventDefault();
      setPendingProduct(null);
      setModalOpen(true);
    }
  };

  const filtered = products
    .filter((p) => filter === "All" || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "asc"
        ? a.priceNum - b.priceNum
        : sort === "desc"
          ? b.priceNum - a.priceNum
          : 0,
    );

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;
  const rv = (id) =>
    visible[id] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5";

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}                         to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .product-card { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,.09); }
      `}</style>

      <div
        className="min-h-screen bg-white text-stone-800"
        style={{
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif",
        }}
      >
        <LoginModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setPendingProduct(null);
          }}
          productName={pendingProduct?.name}
        />

        {/* ── PAGE HEADER ── */}
        <div className="border-b border-stone-100">
          <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
            <p className="text-stone-400 text-[11px] tracking-[0.3em] uppercase font-medium mb-3">
              Collection
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
              <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
                Cửa hàng
              </h1>
              <p className="text-stone-400 text-sm">
                {products.length} products
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* ── TOOLBAR ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <FiSearch
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    filter === cat
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-stone-200 text-stone-600 hover:border-blue-400"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative ml-auto" ref={sortRef}>
              <button
                onClick={() => setSortOpen((p) => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:border-stone-400 transition-colors whitespace-nowrap"
              >
                <FiSliders size={13} /> {sortLabel}
                <FiChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-xl py-1.5 w-48 z-20"
                  style={{ animation: "slideUp .15s ease" }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${sort === opt.value ? "text-stone-900 font-semibold bg-stone-50" : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-stone-400 mb-8 tracking-wide">
            {filtered.length} results
            {filter !== "All" ? ` · ${CATEGORY_LABELS[filter]}` : ""}
            {search ? ` · "${search}"` : ""}
          </p>

          {/* ── PRODUCT GRID ── */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((product, i) => (
                <div
                  key={product.id}
                  id={`card-${product.id}`}
                  data-card
                  className={`product-card group cursor-pointer rounded-xl transition-all duration-500 ${rv(`card-${product.id}`)}`}
                  style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
                >
                  <Link
                    to={`/product/${product.id}`}
                    onClick={handleProductClick}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-100 mb-3 border border-stone-100">
                      {/* FIX LỖI ẢNH: Sử dụng object-contain và bg-white để ảnh không bị méo */}
                      <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-contain bg-white p-2 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-stone-600 text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                        {product.brand}
                      </span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-medium shadow-md whitespace-nowrap flex items-center gap-1.5"
                      >
                        <FiShoppingBag size={12} /> Xem chi tiết
                      </button>
                    </div>
                    <div className="pl-4 pb-4">
                      <p className="text-stone-800 text-sm font-medium mb-0.5 leading-tight group-hover:text-blue-600 transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-stone-900 text-sm font-bold">
                        {product.price}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
                <FiSearch size={20} className="text-stone-400" />
              </div>
              <p className="text-stone-700 font-semibold mb-1 tracking-tight">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-stone-400 text-sm mb-6">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full transition-all active:scale-95"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Bottom bar */}
          {filtered.length > 0 && (
            <div className="mt-16 pt-10 border-t border-stone-100 flex items-center justify-between">
              <p className="text-stone-400 text-sm">
                Showing {filtered.length} / {products.length} products
              </p>
              <Link
                to="/"
                className="text-stone-500 hover:text-stone-900 text-sm flex items-center gap-1.5 transition-colors group"
              >
                Quay lại Trang chủ{" "}
                <FiArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          )}
        </div>

        {/* ── CTA STRIP ── */}
        <section className="relative overflow-hidden bg-blue-950 py-24">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
          <div className="relative max-w-2xl mx-auto text-center px-6 z-10">
            <p className="text-blue-300 text-[11px] tracking-[0.3em] uppercase font-medium mb-4">
              Haven't found what you're looking for?
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
              Schedule a Free Consultation
            </h2>
            <p className="text-stone-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Our experts are ready to help you choose the perfect glasses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm tracking-wide rounded-full transition-all active:scale-95">
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

export default ShopPage;