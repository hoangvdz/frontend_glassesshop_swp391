import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderBar from "../components/prescription/Headerbar";
import FrameSummary from "../components/prescription/FrameSummary";
import PrescriptionTable from "../components/prescription/PrescriptionTable";
import PDSection from "../components/prescription/PDSection";
import ExtrasSection from "../components/prescription/ExtrasSection";
import SubmitBar from "../components/prescription/SubmitBar";
import { getProductByIdApi } from "../api/productApi";
import { addToCartApi } from "../api/cartApi";
import {
  getMyPrescriptionsApi,
  savePrescriptionApi,
  deletePrescriptionApi
} from "../api/prescriptionApi";

export default function PrescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    right: { sph: "", cyl: "", axis: "", add: "" },
    left: { sph: "", cyl: "", axis: "", add: "" },
    pd: "",
    twoPD: false,
    prism: false,
    savePrescription: false,
  });

  const [errors, setErrors] = useState({});

  /* ---------- LOAD PRODUCT ---------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductByIdApi(id);
        setProduct(data);
      } catch (err) {
        console.error("Lỗi lấy thông tin sản phẩm:", err);
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, navigate]);

  /* ---------- LOAD SAVED PRESCRIPTIONS ---------- */
  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoadingRx(true);
      try {
        const res = await getMyPrescriptionsApi();
        const data = res.data?.data || res.data || [];
        setSavedPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi tải đơn thuốc đã lưu:", err);
        setSavedPrescriptions([]);
      } finally {
        setLoadingRx(false);
      }
    };
    fetchPrescriptions();
  }, []);

  /* ---------- APPLY SAVED PRESCRIPTION ---------- */
  const applySavedPrescription = (rx) => {
    setForm((prev) => ({
      ...prev,
      right: {
        sph: rx.sphRight != null ? String(rx.sphRight) : "",
        cyl: rx.cylRight != null ? String(rx.cylRight) : "",
        axis: rx.axisRight != null ? String(rx.axisRight) : "",
        add: rx.addRight != null ? String(rx.addRight) : "",
      },
      left: {
        sph: rx.sphLeft != null ? String(rx.sphLeft) : "",
        cyl: rx.cylLeft != null ? String(rx.cylLeft) : "",
        axis: rx.axisLeft != null ? String(rx.axisLeft) : "",
        add: rx.addLeft != null ? String(rx.addLeft) : "",
      },
      pd: rx.pd != null ? String(rx.pd) : "",
    }));
    setErrors({});
  };

  /* ---------- DELETE PRESCRIPTION ---------- */
  const handleDeletePrescription = async (rxId) => {
    if (!rxId) return;
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa đơn thuốc này khỏi tài khoản không?");
    if (!confirmDelete) return;

    try {
      await deletePrescriptionApi(rxId);
      // Xóa thành công thì lọc cái đơn đó ra khỏi màn hình
      setSavedPrescriptions((prev) => prev.filter((rx) => rx.id !== rxId && rx.prescriptionId !== rxId));
      alert("Đã xóa đơn thuốc thành công!");
    } catch (error) {
      console.error("Lỗi xóa đơn thuốc:", error);
      alert("Không thể xóa đơn thuốc lúc này. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return null;

  /* ---------- UPDATE HELPERS ---------- */

  const updateEye = (eye, field, value) => {
    setForm((prev) => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value },
    }));
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------- VALIDATION ---------- */

  const validate = () => {
    const e = {};
    if (!form.right.sph) e.rightSph = "Bắt buộc";
    if (!form.left.sph) e.leftSph = "Bắt buộc";
    if (!form.pd) e.pd = "Bắt buộc";

    if (form.right.cyl && !form.right.axis)
      e.rightAxis = "Trục cần thiết nếu nhập CYL";

    if (form.left.cyl && !form.left.axis)
      e.leftAxis = "Trục cần thiết nếu nhập CYL";

    return e;
  };

  const handleSubmit = async () => {
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length > 0) return;

    const toNum = (val) => (val === "" || val === null || val === undefined ? null : parseFloat(val));
    const toInt = (val) => (val === "" || val === null || val === undefined ? null : parseInt(val, 10));

    const variantId = product.variants?.[0]?.variantId;
    
    // FIX 1: Lấy chuẩn xác ID do Backend trả về
    const productId = product.productId || product.id; 

    const prescriptionData = {
      sphLeft: toNum(form.left.sph),
      sphRight: toNum(form.right.sph),
      cylLeft: toNum(form.left.cyl),
      cylRight: toNum(form.right.cyl),
      axisLeft: toInt(form.left.axis),
      axisRight: toInt(form.right.axis),
      addLeft: toNum(form.left.add),
      addRight: toNum(form.right.add),
      pd: toNum(form.pd),
    };

    setSubmitting(true);
    try {
      // FIX 3: Xử lý lưu Giỏ hàng Local (Dành cho khách chưa Đăng nhập)
      let cart = [];
      try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch {}
      
      const selectedVariant = product.variants?.[0];
      const finalPrice = selectedVariant?.price || product.price || 0;
      
      const cartItem = {
        productId: productId,
        name: product.name,
        brand: product.brand,
        price: finalPrice,
        quantity: 1,
        variant: selectedVariant,
        isPreOrder: selectedVariant?.stockQuantity === 0,
        isLens: true,
        prescription: prescriptionData
      };

      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));

      // Nếu khách đã đăng nhập, đẩy thẳng lên Database Backend
      if (localStorage.getItem("token")) {
          // Kiểm tra xem khách có chọn lưu đơn thuốc không
          if (form.savePrescription) {
            try { 
              await savePrescriptionApi(prescriptionData); 
              console.log("Đã lưu đơn thuốc vào tài khoản!");
            } catch (e) { 
              console.error("Lỗi khi lưu đơn thuốc:", e);
            }
          }

          const payload = {
            productId: productId,
            variantId: variantId,
            quantity: 1,
            itemType: "PRESCRIPTION",
            fulfillmentType: "PRESCRIPTION",
            isLens: true,
            ...prescriptionData,
          };
          await addToCartApi(payload);
      }

      alert("Đã thêm sản phẩm có độ vào giỏ hàng thành công!");
      
      // FIX 2: Đổi hướng về /checkout vì không có trang /cart
      navigate("/checkout");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      // Nếu API lỗi, thì khách vẫn có giỏ hàng Local Storage để thanh toán tiếp
      alert("Đã lưu vào giỏ hàng tạm thời!");
      navigate("/checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = Object.keys(validate()).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderBar />

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 px-8 py-6 flex-1">
        <FrameSummary product={product} />

        <div>
          <h1 className="text-2xl font-semibold mb-6">
            Nhập đơn thuốc của bạn
          </h1>

          {/* Danh sách đơn thuốc đã lưu KÈM NÚT XÓA */}
          {savedPrescriptions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-3">
                📋 Đơn thuốc đã lưu
              </p>
              <div className="flex flex-wrap gap-2">
                {savedPrescriptions.map((rx, idx) => {
                  const rxId = rx.id || rx.prescriptionId; 
                  return (
                    <div
                      key={rxId || idx}
                      className="flex items-stretch bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => applySavedPrescription(rx)}
                        className="px-3 py-2 text-blue-700 text-xs hover:bg-blue-100 transition-colors font-medium text-left"
                      >
                        Đơn #{idx + 1} — OD: {rx.sphRight ?? "—"} / OS: {rx.sphLeft ?? "—"}
                      </button>
                      {rxId && (
                        <button
                          onClick={() => handleDeletePrescription(rxId)}
                          className="px-2.5 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors border-l border-blue-100"
                          title="Xóa đơn thuốc này"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loadingRx && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Đang tải đơn thuốc đã lưu...
            </div>
          )}

          <PrescriptionTable
            form={form}
            errors={errors}
            updateEye={updateEye}
          />

          <PDSection form={form} errors={errors} updateField={updateField} />

          <ExtrasSection form={form} updateField={updateField} />
        </div>
      </div>

      <SubmitBar onSubmit={handleSubmit} disabled={!isValid || submitting} />
    </div>
  );
}