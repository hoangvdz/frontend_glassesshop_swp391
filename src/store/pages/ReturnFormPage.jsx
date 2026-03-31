import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiUploadCloud, FiChevronLeft } from "react-icons/fi";
import { createReturnRequestApi } from "../api/returnRequestApi";
import { useToast } from "../../context/ToastContext";

function ReturnFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderItemId = queryParams.get("orderItemId");
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    reason: "",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderItemId) {
      showToast(
        "ERROR: Order item ID (orderItemId) not found in the URL. Please go back to the order page and click the Return/Exchange button again.",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderItemId: parseInt(orderItemId),
        requestType: "RETURN",
        reason: `Reason: ${formData.reason}. Details: ${formData.details}`,
      };

      const res = await createReturnRequestApi(payload);

      if (res.data.success) {
        showToast("Return/exchange request sent successfully!");
        setTimeout(() => navigate("/my-orders"), 1200);
      } else {
        showToast("Failed: " + (res.data.message || "Unknown"), "error");
      }
    } catch (error) {
      console.error("Lỗi API Chi tiết:", error);
      const errorMsg = error.response?.data?.message || error.message;
      showToast("Error sending request: " + errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const reasons = [
    { value: "broken", label: "Defective/Scratched product" },
    { value: "wrong_item", label: "Wrong product delivered" },
    { value: "not_fit", label: "Does not fit / Not suitable" },
    { value: "other", label: "Other reason" },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-6 text-sm font-medium"
        >
          <FiChevronLeft /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <h1 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">
            Return/Exchange Request
          </h1>
          <p className="text-stone-500 mb-8 border-b border-stone-100 pb-6">
            Item ID:{" "}
            <span className="font-semibold text-stone-900">
              #{orderItemId || "N/A"}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Reason for Return/Exchange{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
                required
              >
                <option value="" disabled>
                  -- Select Reason --
                </option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                Detailed description of the issue{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="Please describe the problem you are experiencing in detail..."
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 resize-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-widest ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Sending Request..." : "Send Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default ReturnFormPage;
