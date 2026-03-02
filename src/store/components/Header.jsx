import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  FiShoppingBag,
  FiX,
  FiArrowRight,
  FiMinus,
  FiPlus,
} from "react-icons/fi";

import { FaCopyright } from "react-icons/fa";



function Header() {
  const navigate = useNavigate();

  const MENU_ITEMS = [
    { label: "Cửa Hàng", path: "/shop" },
    { label: "Đơn Hàng", path: "/checkout" },
    { label: "Về chúng tôi", path: "/about" },
    { label: "Liên hệ", path: "/contact" },
  ];

  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("cart")) || [],
  );
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser")),
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartRef = useRef(null);
  const userRef = useRef(null);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => {
    const p = parseInt(i.price.replace(/\./g, "").replace("₫", ""));
    return s + p * i.quantity;
  }, 0);

  /* sync storage events */
  useEffect(() => {
    const onStorage = () => {
      setCart(JSON.parse(localStorage.getItem("cart")) || []);
      setCurrentUser(JSON.parse(localStorage.getItem("currentUser")));
    };
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("storage", onStorage);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* close dropdowns on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target))
        setShowCart(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* update qty in cart */
  const updateQty = (id, delta) => {
    const updated = cart
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
      .filter((i) => i.quantity > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (id) => {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const goCheckout = () => {
    setShowCart(false);
    navigate("/checkout");
  };

  return (
    <>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .dropdown { animation: slideDown .2s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <header
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100"
            : "bg-white border-b border-stone-100"
        }`}
        style={{
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="group flex items-end text-2xl font-extrabold tracking-widest"
          >
            <span className="text-stone-900 group-hover:text-amber-500 transition-colors duration-300">
              FALCON
            </span>
            <span className="text-amber-500 text-3xl ml-0.5 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <FaCopyright size={14}/>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] font-semibold text-stone-600">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative pb-1.5 transition-all duration-300 ${isActive ? "text-amber-500" : "hover:text-amber-500"}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={`absolute left-0 -bottom-0 h-[2px] bg-amber-500 rounded-full transition-all duration-300 ${isActive ? "w-full" : "w-0"}`}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* ── CART DROPDOWN ── */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => {
                  setShowCart((p) => !p);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <FiShoppingBag size={18} className="text-stone-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full shadow">
                    {cartCount}
                  </span>
                )}
              </button>

              {showCart && (
                <div className="dropdown absolute right-0 top-full mt-3 w-80 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-50">
                  {/* header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                    <p className="font-semibold text-stone-900 text-sm tracking-tight">
                      Giỏ hàng
                      {cartCount > 0 && (
                        <span className="ml-1.5 text-stone-400 font-normal">
                          ({cartCount})
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => setShowCart(false)}
                      className="text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <FiX size={15} />
                    </button>
                  </div>

                  {/* items */}
                  {cart.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                        <FiShoppingBag size={18} className="text-stone-400" />
                      </div>
                      <p className="text-sm text-stone-500 font-medium mb-1">
                        Giỏ hàng trống
                      </p>
                      <p className="text-xs text-stone-400">
                        Hãy thêm sản phẩm bạn yêu thích!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-72 overflow-y-auto px-5 py-3 space-y-4">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            {/* image */}
                            <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-800 truncate leading-tight">
                                {item.name}
                              </p>
                              <p className="text-xs text-amber-500 font-semibold mt-0.5">
                                {item.price}
                              </p>

                              {/* qty control */}
                              <div className="flex items-center gap-0 mt-1.5 border border-stone-200 rounded-full w-fit overflow-hidden">
                                <button
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                >
                                  <FiMinus size={11} />
                                </button>
                                <span className="w-7 text-center text-xs font-semibold text-stone-800 tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQty(item.id, +1)}
                                  className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                >
                                  <FiPlus size={11} />
                                </button>
                              </div>
                            </div>

                            {/* remove */}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* footer */}
                      <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-stone-500">
                            Tổng cộng
                          </span>
                          <span className="font-semibold text-stone-900 text-sm">
                            {cartTotal.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        <button
                          onClick={goCheckout}
                          className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-amber-500 text-white py-3 rounded-full text-sm font-medium tracking-wide transition-all active:scale-95"
                        >
                          Thanh toán ngay <FiArrowRight size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* USER */}
            {currentUser ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => {
                    setShowUserMenu((p) => !p);
                    setShowCart(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${currentUser.name || currentUser.email}&background=1c1917&color=fff&bold=true`}
                    alt="User"
                    className="w-9 h-9 rounded-full border-2 border-stone-200 hover:border-amber-400 transition"
                  />
                </button>

                {showUserMenu && (
                  <div className="dropdown absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-medium text-stone-700 truncate">
                        {currentUser.name || "Người dùng"}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-stone-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wider hover:bg-amber-500 transition-all duration-300"
              >
                Đăng nhập
              </button>
            )}
          </nav>

          {/* MOBILE */}
          <button className="md:hidden text-stone-700 p-2">
            <FiShoppingBag size={20} />
          </button>
        </div>
      </header>
    </>
  );
}

export default Header;
