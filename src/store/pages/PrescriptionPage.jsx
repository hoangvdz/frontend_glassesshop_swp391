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

    const payload = {
      productId: product.id,
      variantId: variantId,
      quantity: 1,
      itemType: "PRESCRIPTION",
      fulfillmentType: "PRESCRIPTION",
      isLens: true,
      ...prescriptionData,
    };

    setSubmitting(true);
    try {
      // 1. Lưu đơn thuốc nếu user chọn checkbox "Lưu đơn thuốc"
      if (form.savePrescription) {
        try {
          await savePrescriptionApi(prescriptionData);
          console.log("Đã lưu đơn thuốc thành công!");
        } catch (saveErr) {
          console.error("Lỗi lưu đơn thuốc:", saveErr);
          // Không block việc thêm vào giỏ hàng
        }
      }

      // 2. Thêm vào giỏ hàng
      console.log("SUBMITTING TO CART", payload);
      await addToCartApi(payload);
      alert("Đã thêm sản phẩm có độ vào giỏ hàng thành công!");
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      const msg = err?.response?.data?.message || "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.";
      alert(msg);
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

          {/* Danh sách đơn thuốc đã lưu */}
          {savedPrescriptions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-3">
                📋 Đơn thuốc đã lưu
              </p>
              <div className="flex flex-wrap gap-2">
                {savedPrescriptions.map((rx, idx) => (
                  <button
                    key={rx.id || idx}
                    onClick={() => applySavedPrescription(rx)}
                    className="px-3 py-2 bg-white border border-blue-200 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors font-medium shadow-sm"
                  >
                    Đơn #{idx + 1} — OD: {rx.sphRight ?? "—"} / OS: {rx.sphLeft ?? "—"}
                  </button>
                ))}
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