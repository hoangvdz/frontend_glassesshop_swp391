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

export default function PrescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    right: { sph: "", cyl: "", axis: "", add: "" },
    left: { sph: "", cyl: "", axis: "", add: "" },
    pd: "",
    twoPD: false,
    prism: false,
    savePrescription: false,
  });

  const [errors, setErrors] = useState({});

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

    const payload = {
      productId: product.id,
      variantId: variantId,
      quantity: 1,
      isLens: true,
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

    try {
      console.log("SUBMITTING TO CART", payload);
      await addToCartApi(payload);
      alert("Đã thêm sản phẩm có độ vào giỏ hàng thành công!");
      navigate("/cart");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng:", err);
      const msg = err?.response?.data?.message || "Thêm vào giỏ hàng thất bại. Vui lòng thử lại.";
      alert(msg);
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

          <PrescriptionTable
            form={form}
            errors={errors}
            updateEye={updateEye}
          />

          <PDSection form={form} errors={errors} updateField={updateField} />

          <ExtrasSection form={form} updateField={updateField} />
        </div>
      </div>

      <SubmitBar onSubmit={handleSubmit} disabled={!isValid} />
    </div>
  );
}