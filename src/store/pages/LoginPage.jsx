import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import { adminMock } from "../data/loginMock";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Hook lấy dữ liệu state truyền từ trang trước

  // Tìm xem trang trước đó là trang nào? (nếu không có thì mặc định về Home '/')
  // Ví dụ: từ Cart sang -> from sẽ là "/cart"
  const from = location.state?.from || "/";

  const isAdminLoggin = adminMock;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const adminAccount = isAdminLoggin.find(
      (admin) =>
        admin.email === email.trim() &&
        admin.password === password.trim() &&
        admin.role_EN === "Admin"
    );

    // 1. Logic Admin
    if (adminAccount) {
      alert("Xin chào Admin!");
      localStorage.setItem("currentUser", JSON.stringify(adminAccount));
      window.dispatchEvent(new Event("storage"));
      navigate("/dashboard");
      return;
    }

    // 2. Logic Khách hàng
    const userLink = { email: email, role: "customer", name: "Khách hàng" };
    localStorage.setItem("currentUser", JSON.stringify(userLink));
    window.dispatchEvent(new Event("storage")); // Bắn sự kiện cập nhật Header

    alert("Đăng nhập thành công!");

    // 3. QUAY VỀ TRANG TRƯỚC ĐÓ (Cart hoặc Home)
    navigate(from);
  };

  const handleGoogleLogin = () => {
    const googleUser = {
      email: "google@gmail.com",
      role: "customer",
      name: "Google User",
    };
    localStorage.setItem("currentUser", JSON.stringify(googleUser));
    window.dispatchEvent(new Event("storage"));

    alert("Đăng nhập Google thành công!");
    navigate(from); // Quay về trang trước
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 z-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại
          </h2>
        </div>
        <form className="space-y-5" onSubmit={handleLogin}>
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Mật khẩu"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-amber-600 transition"
          >
            Đăng nhập
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <span className="text-sm font-medium text-gray-700">
            Đăng nhập với Google
          </span>
        </button>
        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-amber-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
