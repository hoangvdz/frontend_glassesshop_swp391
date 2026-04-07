import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    FiChevronLeft, 
    FiAlertCircle, 
    FiCheckCircle, 
    FiRotateCcw, 
    FiEdit3, 
    FiHelpCircle,
    FiPackage,
    FiShield
} from "react-icons/fi";
import {
    createReturnRequestApi,
    // getReturnRequestByOrderItemApi,
    getReturnRequestsByOrderItemApi,
} from "../api/returnRequestApi";
import { motion } from "framer-motion";

function ReturnFormPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const orderItemId = queryParams.get("orderItemId");

    const [existingRequest, setExistingRequest] = useState(null);
    const [checking, setChecking] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        requestType: "RETURN",
        reason: "",
        details: "",
    });

    useEffect(() => {
        const checkExisting = async () => {
            try {
                const res = await getReturnRequestsByOrderItemApi(orderItemId);
                const requests = Array.isArray(res?.data?.data) ? res.data.data : [];

                if (requests.length > 0) {
                    setExistingRequest(requests[0]);
                }
            } catch {
                // no existing request
            } finally {
                setChecking(false);
            }
        };

        if (orderItemId) checkExisting();
        else setChecking(false);
    }, [orderItemId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (existingRequest || !orderItemId || !formData.reason.trim() || !formData.details.trim()) return;

        setSubmitting(true);
        try {
            const payload = {
                orderItemId: parseInt(orderItemId, 10),
                returnQuantity: 1,
                reason: formData.reason,
                description: formData.details,
                imageUrl: "",
                requestType: formData.requestType,
            };
            const res = await createReturnRequestApi(payload);
            if (res?.data?.success) navigate("/my-orders");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const reasons = [
        { value: "Defective/Scratched product", label: "Defective/Scratched product" },
        { value: "Wrong product delivered", label: "Wrong product delivered" },
        { value: "Does not fit / Not suitable", label: "Does not fit / Not suitable" },
        { value: "Other reason", label: "Other reason" },
    ];

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (existingRequest) {
        return (
            <div className="min-h-screen bg-[#fcfcfc] pt-24 px-6">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FiAlertCircle size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mb-2">Request Already Exists</h1>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">
                        You have already submitted a request for this item. 
                        Please wait for our team to review your current Case #{existingRequest.requestId}.
                    </p>
                    <button
                        onClick={() => navigate("/my-orders")}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Return to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] pt-24 pb-20 px-6 font-sans">
            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-[11px] font-bold uppercase tracking-widest"
                >
                    <FiChevronLeft /> Back to Order
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <FiRotateCcw size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Return & Exchange</h1>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Item Ref: #{orderItemId}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                <FiShield /> Request Type 
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {["RETURN", "EXCHANGE"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, requestType: type })}
                                        className={`py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                                            formData.requestType === type 
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                <FiHelpCircle /> Reason for Request
                            </label>
                            <select
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-200 transition-all appearance-none"
                                required
                            >
                                <option value="" disabled>-- Select Reason --</option>
                                {reasons.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                                <FiEdit3 /> More Details 
                            </label>
                            <textarea
                                rows="4"
                                placeholder="Describe the issue you're facing..."
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-blue-200 transition-all resize-none leading-normal"
                                required
                            />
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-4 flex gap-3 border border-dashed border-slate-200">
                            <FiPackage className="text-slate-400 mt-0.5 flex-shrink-0" size={14} />
                            <p className="text-[10px] font-semibold text-slate-400 leading-relaxed uppercase tracking-tighter italic">
                                Once submitted, we will process your request within 2-3 business days. Tracking is available in history.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !formData.reason || !formData.details}
                            className={`w-full py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                                submitting || !formData.reason || !formData.details
                                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-[0.98]"
                            }`}
                        >
                            {submitting ? "Processing..." : "Submit My Request"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReturnFormPage;