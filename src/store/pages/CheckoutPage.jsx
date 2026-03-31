import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiTruck,
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiMinus,
  FiPlus,
  FiX,
} from "react-icons/fi";

import {
  deleteCartItemService,
  getCartByUserService,
  updateCartItemService,
} from "../services/cartService";

import { checkoutOrder, createVNPayPayment } from "../services/checkoutService";

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

function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs text-stone-500 tracking-[0.15em] uppercase font-medium mb-2">
        {Icon && <Icon size={12} />}
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();

  const southernCities = [
    { name: "Hồ Chí Minh", distance: 1 },
    { name: "Bình Dương", distance: 5 },
    { name: "Đồng Nai", distance: 6 },
    { name: "Bà Rịa - Vũng Tàu", distance: 7 },
    { name: "Long An", distance: 8 },
    { name: "Tiền Giang", distance: 9 },
    { name: "Vĩnh Long", distance: 10 },
    { name: "Cần Thơ", distance: 12 },
    { name: "An Giang", distance: 13 },
    { name: "Sóc Trăng", distance: 14 },
    { name: "Bạc Liêu", distance: 15 },
    { name: "Cà Mau", distance: 16 },
    { name: "Kiên Giang", distance: 18 },
    { name: "Trà Vinh", distance: 11 },
  ];

  const calculateShippingFee = (city, total) => {
    if (!city) return 0;
    if (total > 1000000) return 0;
    const selected = southernCities.find((c) => c.name === city);
    if (!selected) return 0;
    if (city === "Hồ Chí Minh") return 10000;
    return selected.distance * 10000;
  };

  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let user;
    try {
      user = JSON.parse(localStorage.getItem("currentUser"));
    } catch (e) {
      user = null;
    }

    // Allow guest checkout — don't redirect to login
    // we'll just check if there's a local cart if no user
    const fetchCart = async () => {
      try {
        let cartData = [];
        if (user) {
          const res = await getCartByUserService(user.userId);
          cartData = Array.isArray(res) ? res : res?.data || [];
        } else {
          // GUEST FLOW: Load from localStorage
          cartData = JSON.parse(localStorage.getItem("cart")) || [];
        }



        const checkLocalPreorder = (vId) => {
          try {
            const raw = localStorage.getItem("frontend_preorders");
            if (!raw) return false;
            return !!(JSON.parse(raw)[vId]);
          } catch { return false; }
        };

        const mapped = cartData.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          name: item.productName || item.product?.name,
          image:
            item.imageUrl ||
            item.product?.imageUrl ||
            "https://placehold.co/100",
          price: item.unitPrice || 0,
          quantity: item.quantity,
          // Preserving prescription data
          isLens: item.isLens,
          sphLeft: item.sphLeft,
          sphRight: item.sphRight,
          cylLeft: item.cylLeft,
          cylRight: item.cylRight,
          axisLeft: item.axisLeft,
          axisRight: item.axisRight,
          addLeft: item.addLeft,
          addRight: item.addRight,
          pd: item.pd,
          prescription: item.prescription,
          itemType: item.itemType || item.type,
          isPreorder: item.isPreorder || checkLocalPreorder(item.variantId),
          variant: {
            variantId: item.variantId,
            color: item.variantColor,
            frameSize: item.variantSize,
          },
        }));

        setCartItems(mapped);
        localStorage.setItem("cart", JSON.stringify(mapped));
        window.dispatchEvent(new Event("storage"));

        if (mapped.length === 0) navigate("/shop");
      } catch (error) {
        console.error("Fetch cart error:", error);
      }
    };

    fetchCart();
    if (user) setFormData((prev) => ({ ...prev, fullName: user.name || "" }));
  }, [navigate]);

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );
  const shippingFee = calculateShippingFee(formData.city, total);
  const totalWithShipping = total + shippingFee;

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        // 🔥 CHỈ CHO NHẬP SỐ
        if (name === "phone") {
            newValue = value.replace(/\D/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };
  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const updateQty = async (productId, variantId, delta, cartItemId) => {
    const item = cartItems.find(
      (i) => String(i.cartItemId) === String(cartItemId),
    );
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await removeItem(productId, variantId, cartItemId);
      return;
    }
    try {
      await updateCartItemService(cartItemId, newQty);
      const updated = cartItems.map((i) =>
        String(i.cartItemId) === String(cartItemId)
          ? { ...i, quantity: newQty }
          : i,
      );
      setCartItems(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
    } catch (error) {
      showToast("Quantity update failed!");
    }
  };

  const removeItem = async (productId, variantId, cartItemId) => {
    try {
      await deleteCartItemService(cartItemId);
      const updated = cartItems.filter(
        (i) => String(i.cartItemId) !== String(cartItemId),
      );
      setCartItems(updated);
      localStorage.setItem("cart", JSON.stringify(updated));
      if (updated.length === 0) navigate("/shop");
    } catch (error) {
      showToast("Failed to remove product!");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.city
    ) {
      showToast("Please fill in all information!");
      return;
    }

    setPlacing(true);

    try {
      const order = await checkoutOrder(
        formData,
        shippingFee,
        cartItems,
        paymentMethod,
      );



      // ✅ VNPay
      if (paymentMethod === "VNPAY") {
        const paymentUrl = await createVNPayPayment(
          order.finalPrice,
          order.orderId,
        );




        window.location.href = paymentUrl; // 🚀 chuyển trang
        return;
      }

      // ✅ COD
      setSuccess(true);
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => navigate("/"), 2200);
    } catch (error) {
      showToast(error.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  if (success)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm animate-pulse">
          <FiCheck size={40} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Successful!</h2>
          <p className="text-stone-400">Redirecting to home page...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans">
      <div className="border-b border-stone-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-800 text-sm"
        >
          <FiArrowLeft size={14} /> Back
        </button>
        <p className="text-[11px] text-stone-400 tracking-widest uppercase font-medium">
          Checkout
        </p>
        <div className="w-16" />
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10"
      >
        <div className="space-y-8">
          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" required icon={FiUser}>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </Field>
              <Field label="Phone Number" required icon={FiPhone}>
                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </Field>
              <Field label="City / Province" required icon={FiMapPin}>
                <select
                  name="city"
                  required
                  value={formData.city || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">Select City/Province</option>
                  {southernCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Address" required icon={FiMapPin}>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </Field>
            </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Payment
            </h2>

            {/* COD */}
            <div
              onClick={() => setPaymentMethod("COD")}
              className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer ${
                paymentMethod === "COD"
                  ? "border-black bg-stone-50"
                  : "border-stone-200"
              }`}
            >
              <FiTruck />
              <div>
                <p className="text-sm font-medium">Cash on Delivery (COD)</p>
              </div>
            </div>

            {/* VNPay */}
            <div
              onClick={() => setPaymentMethod("VNPAY")}
              className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer mt-3 ${
                paymentMethod === "VNPAY"
                  ? "border-black bg-stone-50"
                  : "border-stone-200"
              }`}
            >
              <FiCreditCard />
              <div>
                <p className="text-sm font-medium">VNPay Payment</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="font-semibold mb-5">
            Your Order ({cartItems.length})
          </h3>
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex gap-3 text-sm">
                <img src={item.image} className="w-12 h-12 rounded-lg object-cover border border-stone-100" />
                <div className="flex-1 min-w-0 flex justify-between">
                  <div>
                    <p className="font-medium truncate pr-2">{item.name}</p>
                    <p className="text-xs text-stone-400">Qty: {item.quantity} · {item.price.toLocaleString()}₫</p>
                    {item.isLens && !item.isPreorder && <p className="text-[10px] text-indigo-500 font-bold mt-0.5 tracking-tight uppercase">Prescription Order</p>}
                  </div>
                  <button onClick={() => removeItem(item.productId, item.variant?.variantId, item.cartItemId)} className="text-stone-400 hover:text-red-500 p-1 -mt-1 -mr-2 h-fit" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span>{total.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Shipping Fee</span>
              <span>{shippingFee.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-100">
              <span>Total</span>
              <span className="text-blue-600">
                {totalWithShipping.toLocaleString()}₫
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="w-full mt-6 bg-black text-white py-4 rounded-full font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 shadow-lg"
          >
            {placing ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
