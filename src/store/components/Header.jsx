import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false); // Menu dropdown cho user

  // Hàm cập nhật dữ liệu từ localStorage
  const updateData = () => {
    // 1. Cập nhật giỏ hàng
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);

    // 2. Cập nhật User
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);
  };

  useEffect(() => {
    updateData(); // Chạy lần đầu

    // Lắng nghe sự kiện 'storage' từ các tab/component khác
    const handleStorageChange = () => updateData();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowUserMenu(false);
    alert("Đăng xuất thành công!");
    navigate("/");
    window.dispatchEvent(new Event("storage"));
  };

  return (
      <header className="fixed w-full top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-xl font-bold tracking-wide text-gray-900">
            🦅 FALCON EYEWEAR
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
            <Link to="/shop" className="hover:text-amber-600 transition-colors font-medium">Cửa hàng</Link>
            <Link to="/prescription" className="hover:text-amber-600 transition-colors font-medium">Đơn hàng</Link>
            <Link to="#" className="hover:text-amber-600 transition-colors font-medium">Giới thiệu</Link>
            <Link to="#" className="hover:text-amber-600 transition-colors font-medium">Liên hệ</Link>

            {/* ICON GIỎ HÀNG */}
            <Link to="/cart" className="relative group p-2 hover:bg-gray-100 rounded-full transition">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
              )}
            </Link>

            {/* KHU VỰC USER (LOGIN HOẶC AVATAR) */}
            {currentUser ? (
                <div className="relative">
                  {/* Avatar Button */}
                  <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 focus:outline-none"
                  >
                    <img
                        src={`https://ui-avatars.com/api/?name=${currentUser.name || currentUser.email}&background=random`}
                        alt="User"
                        className="w-8 h-8 rounded-full border border-gray-300"
                    />
                    <span className="font-bold normal-case text-gray-700 hidden lg:block">
                                    {currentUser.name || "User"}
                                </span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 animate-fade-in-down">
                        <div className="px-4 py-2 border-b text-xs text-gray-500 truncate">
                          {currentUser.email}
                        </div>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                          Đăng xuất
                        </button>
                      </div>
                  )}

                  {/* Overlay tắt menu khi click ra ngoài */}
                  {showUserMenu && <div className="fixed inset-0 z-[-1]" onClick={() => setShowUserMenu(false)}></div>}
                </div>
            ) : (
                // NẾU CHƯA LOGIN -> HIỆN NÚT LOGIN
                <button
                    onClick={() => navigate('/login')}
                    className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-600 transition-all shadow-md"
                >
                  ĐĂNG NHẬP
                </button>
            )}
          </nav>

          <button className="md:hidden text-2xl text-gray-600">☰</button>
        </div>
      </header>
  );
}

export default Header;