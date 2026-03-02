import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft, FiCheck, FiTruck, FiCreditCard,
  FiUser, FiPhone, FiMapPin, FiFileText,
} from "react-icons/fi";

/* ── Toast ── */
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

/* ── Input component ── */
function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-stone-500 tracking-[0.15em] uppercase font-medium mb-2">
        {Icon && <Icon size={12} />}
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── MAIN ── */
function CheckoutPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData]   = useState({ fullName:"", phone:"", address:"", note:"" });
  const [toast, setToast]         = useState({ visible:false, message:"" });
  const [placing, setPlacing]     = useState(false);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    if (stored.length === 0) { navigate("/shop"); return; }
    setCartItems(stored);

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setFormData((p) => ({ ...p, fullName: user.name || "" }));
  }, [navigate]);

  const parsePrice = (s) => parseInt(s.replace(/\./g,"").replace("₫",""));
  const total = cartItems.reduce((acc, i) => acc + parsePrice(i.price) * i.quantity, 0);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const showToast = (msg) => {
    setToast({ visible:true, message:msg });
    setTimeout(() => setToast({ visible:false, message:"" }), 3000);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      showToast("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setPlacing(true);

    /* simulate short processing */
    setTimeout(() => {
      const order = {
        id: Date.now(),
        customer: formData,
        items: cartItems,
        total,
        date: new Date().toLocaleString(),
        status: "Pending",
      };
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("storage"));

      setPlacing(false);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2200);
    }, 900);
  };

  /* ── SUCCESS SCREEN ── */
  if (success) return (
    <>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}`}</style>
      <div className="min-h-screen bg-white flex items-center justify-center px-6"
        style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif"}}>
        <div className="text-center max-w-sm" style={{animation:"slideUp .5s ease"}}>
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6" style={{animation:"scaleIn .4s .1s both"}}>
            <FiCheck size={26} className="text-green-500"/>
          </div>
          <p className="text-stone-400 text-[11px] tracking-[0.25em] uppercase font-medium mb-2">Đặt hàng thành công</p>
          <h2 className="text-2xl font-semibold text-stone-900 tracking-tight mb-3">Cảm ơn bạn!</h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-2">
            Đơn hàng của bạn đã được tiếp nhận. Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>
          <p className="text-stone-300 text-xs">Đang chuyển về trang chủ...</p>
        </div>
      </div>
    </>
  );

  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 transition-colors";

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}                         to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .spin { animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Toast visible={toast.visible} message={toast.message}/>

      <div
        className="min-h-screen bg-white text-stone-800"
        style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif"}}
      >

        {/* ── top bar ── */}
        <div className="border-b border-stone-100">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-800 text-sm transition-colors group"
            >
              <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/>
              Quay lại
            </button>
            <p className="text-[11px] text-stone-400 tracking-[0.25em] uppercase font-medium">Thanh toán</p>
            <div className="w-16"/>
          </div>
        </div>

        {/* ── page heading ── */}
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
          <p className="text-stone-400 text-[11px] tracking-[0.3em] uppercase font-medium mb-2">Hoàn tất đơn hàng</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">Đặt hàng</h1>
        </div>

        {/* ── main form ── */}
        <form onSubmit={handlePlaceOrder}>
          <div className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

            {/* ─── LEFT: delivery form ─── */}
            <div className="space-y-8" style={{animation:"slideUp .45s ease"}}>

              {/* Delivery info */}
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">1</div>
                  <h2 className="font-semibold text-stone-900 tracking-tight">Thông tin giao hàng</h2>
                </div>

                <div className="space-y-5">
                  <Field label="Họ và tên" required icon={FiUser}>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                      className={inputCls} placeholder="Nguyễn Văn A"/>
                  </Field>

                  <Field label="Số điện thoại" required icon={FiPhone}>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                      className={inputCls} placeholder="0912 xxx xxx"/>
                  </Field>

                  <Field label="Địa chỉ nhận hàng" required icon={FiMapPin}>
                    <textarea name="address" required rows={3} value={formData.address} onChange={handleChange}
                      className={inputCls} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."/>
                  </Field>

                  <Field label="Ghi chú" icon={FiFileText}>
                    <input type="text" name="note" value={formData.note} onChange={handleChange}
                      className={inputCls} placeholder="Giao giờ hành chính, gọi trước khi giao..."/>
                  </Field>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">2</div>
                  <h2 className="font-semibold text-stone-900 tracking-tight">Phương thức thanh toán</h2>
                </div>

                <div className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl bg-stone-50 cursor-pointer">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-900 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-900"/>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 flex items-center gap-2">
                      <FiTruck size={14}/> Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      Chỉ thanh toán khi đã nhận được hàng và kiểm tra sản phẩm.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border border-stone-100 rounded-xl cursor-not-allowed opacity-40 mt-3">
                  <div className="w-5 h-5 rounded-full border-2 border-stone-300 mt-0.5 flex-shrink-0"/>
                  <div>
                    <p className="text-sm font-medium text-stone-600 flex items-center gap-2">
                      <FiCreditCard size={14}/> Thẻ / Ví điện tử
                    </p>
                    <p className="text-xs text-stone-400 mt-1">Sắp ra mắt</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ─── RIGHT: order summary ─── */}
            <div className="space-y-4" style={{animation:"slideUp .55s ease"}}>

              {/* Items */}
              <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-stone-900 tracking-tight mb-5">
                  Đơn hàng · <span className="text-stone-400 font-normal">{cartItems.length} sản phẩm</span>
                </h3>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-1 mb-5">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate leading-tight">{item.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 flex-shrink-0">{item.price}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2.5">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-semibold text-stone-900">Tổng cộng</span>
                  <span className="text-xl font-semibold text-amber-500">{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>

              {/* Free shipping badge */}
              <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
                <FiTruck size={14} className="text-green-600 flex-shrink-0"/>
                <p className="text-xs text-green-700 font-medium">Miễn phí vận chuyển cho đơn hàng của bạn</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-amber-500 text-white py-4 rounded-full font-medium text-sm tracking-wide transition-all active:scale-95 shadow-lg shadow-stone-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FiCheck size={16}/>
                    Đặt hàng · {total.toLocaleString("vi-VN")}₫
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-400 leading-relaxed px-2">
                Bằng cách đặt hàng, bạn đồng ý với chính sách đổi trả và bảo hành của chúng tôi.
              </p>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default CheckoutPage;