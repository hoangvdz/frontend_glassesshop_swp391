import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import {
    createReturnRequestApi,
    getReturnRequestByOrderItemApi,
} from "../api/returnRequestApi";

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
                const res = await getReturnRequestByOrderItemApi(orderItemId);
                if (res?.data?.data) {
                    setExistingRequest(res.data.data);
                }
            } catch {
                // no existing request
            } finally {
                setChecking(false);
            }
        };

        if (orderItemId) {
            checkExisting();
        } else {
            setChecking(false);
        }
    }, [orderItemId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (existingRequest) {
            alert("A request has already been submitted for this item.");
            return;
        }

        if (!orderItemId) {
            alert(
                "ERROR: Order item ID (orderItemId) not found in the URL. Please go back and try again.",
            );
            return;
        }

        if (!formData.reason.trim()) {
            alert("Please select a reason.");
            return;
        }

        if (!formData.details.trim()) {
            alert("Please enter a detailed description.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                orderItemId: parseInt(orderItemId, 10),
                reason: formData.reason,
                description: formData.details,
                imageUrl: "",
                requestType: formData.requestType, // RETURN / EXCHANGE
            };

            const res = await createReturnRequestApi(payload);

            if (res?.data?.success) {
                alert(
                    `${formData.requestType === "EXCHANGE" ? "Exchange" : "Return"} request submitted successfully!`,
                );
                navigate("/my-orders");
            } else {
                alert("Failed: " + (res?.data?.message || "Unknown"));
            }
        } catch (error) {
            console.error("Return request API error:", error);
            const errorMsg = error.response?.data?.message || error.message;
            alert("Error sending request: " + errorMsg);
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
        return <div className="pt-24 text-center">Loading...</div>;
    }

    if (existingRequest) {
        return (
            <div className="min-h-screen bg-stone-50 pt-24 px-6">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-stone-900 mb-4">
                        Return/Exchange Request
                    </h1>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-700">
                            A request has already been submitted for this item.
                        </p>
                        <p className="text-sm text-stone-600 mt-2">
                            You cannot submit another request.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/my-orders")}
                        className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

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
                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">
                                Request Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.requestType}
                                onChange={(e) =>
                                    setFormData({ ...formData, requestType: e.target.value })
                                }
                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-stone-400 transition-colors"
                                required
                            >
                                <option value="RETURN">Return</option>
                                <option value="EXCHANGE">Exchange</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">
                                Reason for Return/Exchange <span className="text-red-500">*</span>
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
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-700 mb-2">
                                Detailed description of the issue <span className="text-red-500">*</span>
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
                            className={`w-full py-4 mt-4 text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-widest ${
                                submitting
                                    ? "bg-stone-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
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