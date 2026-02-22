import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiChevronLeft,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { adminMock } from "../data/adminMock";

function AdminTopHeader({ onToggleSidebar, collapsed }) {
  const [open, setOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const admin = adminMock;

  // Mock notifications
  const notifications = [
    { id: 1, text: "Đơn hàng #1042 vừa được tạo", time: "2 phút trước", unread: true },
    { id: 2, text: "Sản phẩm 'Kính A1' sắp hết hàng", time: "15 phút trước", unread: true },
    { id: 3, text: "Báo cáo tháng 6 đã sẵn sàng", time: "1 giờ trước", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close one dropdown when the other opens
  const toggleMenu = () => {
    setOpen((v) => !v);
    setNotifOpen(false);
  };
  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    setOpen(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="h-20 px-6 flex justify-between items-center">

        {/* ── LEFT ── */}
        <div className="flex items-center gap-4">
          {/* Sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
            className="flex items-center px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <FiChevronLeft size={16} />
            </motion.div>
          </button>

          {/* Search */}
          <div className="relative hidden md:block">
            <FiSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200 ${
                searchFocused ? "text-blue-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-56 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="flex items-center gap-2">

          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={toggleNotif}
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title="Thông báo"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"
                />
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">Thông báo</p>
                    {unreadCount > 0 && (
                      <span className="text-xs text-blue-500 font-medium">{unreadCount} chưa đọc</span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${
                          n.unread ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {n.unread && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 " />
                        )}
                        {!n.unread && <span className="mt-1.5 w-2 h-2 " />}
                        <div>
                          <p className="text-sm text-slate-700 leading-snug">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <button className="text-xs text-blue-500 hover:underline font-medium">
                      Xem tất cả thông báo
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings shortcut */}
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            title="Cài đặt"
          >
            <FiSettings size={18} />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Avatar / user menu */}
          <div
            ref={menuRef}
            className="relative flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            onClick={toggleMenu}
          >
            <div className="relative group">
              <img
                src={admin.img}
                alt={admin.name}
                className="w-10 h-10 rounded-full object-cover shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-500"
              />
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>

            <div className="hidden sm:block text-sm">
              <p className="font-medium text-slate-800 leading-tight">{admin.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-14 w-60 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* User info */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={admin.img}
                      alt={admin.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 truncate">{admin.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{admin.email}</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="py-1">
                    <button
                      onClick={() => { navigate("/dashboard/profile"); setOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FiUser size={15} className="text-slate-400" />
                      Hồ sơ
                    </button>

                    <button
                      onClick={() => { navigate("/dashboard/settings"); setOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FiSettings size={15} className="text-slate-400" />
                      Cài đặt
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="py-1">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 transition"
                    >
                      <FiLogOut size={15} />
                      Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTopHeader;