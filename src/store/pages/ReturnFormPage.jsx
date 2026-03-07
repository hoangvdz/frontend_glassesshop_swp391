import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

function ReturnFormPage() {
  const [formData, setFormData] = useState({
    reason: "",
    details: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Yêu cầu đổi/trả của bạn đã được tiếp nhận. Falcon sẽ liên hệ sớm!");
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">
          Yêu cầu đổi/trả hàng
        </h1>
        <p className="text-stone-500 mb-8 border-b border-stone-100 pb-6">
          Vui lòng cung cấp thông tin chi tiết để chúng tôi hỗ trợ bạn tốt nhất.
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
              <option value="broken">Sản phẩm bị lỗi/trầy xước</option>
              <option value="wrong_item">Giao sai sản phẩm</option>
              <option value="not_fit">Đeo không vừa / Không hợp</option>
              <option value="other">Lý do khác</option>
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

          {/* Image Upload Mock */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Hình ảnh minh chứng (Tùy chọn)
            </label>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center text-stone-400 bg-stone-50 cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-colors">
              <FiUploadCloud size={32} className="mb-2" />
              <p className="text-sm">Nhấn để tải ảnh lên (Tối đa 3 ảnh)</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-widest"
          >
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReturnFormPage;