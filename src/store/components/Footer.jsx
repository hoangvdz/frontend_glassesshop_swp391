function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-24">
      <div className="w-full px-6 md:px-12 py-12">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-lg font-bold tracking-wide mb-4">
              Mắt Kính
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Mắt kinh thời trang cao cấp, nơi phong cách gặp gỡ chất lượng.  
              Thiết kế tinh tế, chất lượng vượt trội, mang đến sự tự tin và phong cách cho mọi ánh nhìn.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Cửa hàng
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:opacity-60 cursor-pointer">Hàng mới</li>
              <li className="hover:opacity-60 cursor-pointer">Kính mắt công sở</li>
              <li className="hover:opacity-60 cursor-pointer">Kính râm</li>
              <li className="hover:opacity-60 cursor-pointer">Phụ kiện</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:opacity-60 cursor-pointer">Giới thiệu</li>
              <li className="hover:opacity-60 cursor-pointer">Vận chuyển & Trả hàng</li>
              <li className="hover:opacity-60 cursor-pointer">Bảo hành</li>
              <li className="hover:opacity-60 cursor-pointer">Liên hệ</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>Email: support@eyewear.com</li>
              <li>Phone: +84 123 456 789</li>
              <li>Location: Ho Chi Minh City</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p className="text-xs text-gray-400 tracking-wide">
            © 2026 Bản quyền thuộc về Mắt Kính. Bảo lưu mọi quyền.
          </p>

          {/* Social */}
          <div className="flex gap-6 text-xs uppercase tracking-widest text-gray-400">
            <span className="hover:opacity-60 cursor-pointer">Instagram</span>
            <span className="hover:opacity-60 cursor-pointer">Facebook</span>
            <span className="hover:opacity-60 cursor-pointer">TikTok</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
