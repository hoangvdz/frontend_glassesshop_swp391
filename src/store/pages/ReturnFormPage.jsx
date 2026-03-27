import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiUploadCloud, FiChevronLeft } from "react-icons/fi";
import { submitServiceRequestApi } from "../api/serviceRequestApi";

function ReturnFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderItemId = queryParams.get("orderItemId");

  const [formData, setFormData] = useState({
    reason: "",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit request for Item:", orderItemId);
    
    if (!orderItemId) {
      alert("LỖI: Không tìm thấy mã sản phẩm (orderItemId) trong đường dẫn. Hãy quay lại trang đơn hàng và nhấn nút Đổi Trả lại.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderItemId: parseInt(orderItemId),
        requestType: "RETURN",
        reason: `Lý do: ${formData.reason}. Chi tiết: ${formData.details}`,
      };
      
      console.log("Gửi Payload:", payload);

      const res = await submitServiceRequestApi(payload);
      console.log("Backend phản hồi:", res.data);

      if (res.data.success) {
        alert("Yêu cầu đổi/trả đã được gửi thành công!");
        navigate("/my-orders");
      } else {
        alert("Thất bại: " + (res.data.message || "Không xác định"));
      }
    } catch (error) {
      console.error("Lỗi API Chi tiết:", error);
      const errorMsg = error.response?.data?.message || error.message;
      alert("Lỗi khi gửi yêu cầu: " + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    { value: "broken", label: "Sản phẩm bị lỗi/trầy xước" },
    { value: "wrong_item", label: "Giao sai sản phẩm" },
    { value: "not_fit", label: "Đeo không vừa / Không hợp" },
    { value: "other", label: "Lý do khác" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 text-sm font-medium"
        >
          <FiChevronLeft /> Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">
            Yêu cầu đổi/trả hàng
          </h1>
          <p className="text-stone-500 mb-8 border-b border-stone-100 pb-6">
            Mã món hàng: <span className="font-semibold text-stone-900">#{orderItemId || "N/A"}</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Lý do đổi trả <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
                required
              >
                <option value="" disabled>-- Chọn lý do --</option>
                {reasons.map(r => (
                  <option key={r.value} value={r.label}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Mô tả chi tiết tình trạng <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 mt-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-widest ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ReturnFormPage;