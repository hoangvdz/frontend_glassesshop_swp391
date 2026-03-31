import React, { useEffect, useMemo, useState } from "react";
import {
    getAllReturnRequestsApi,
    updateReturnRequestStatusApi,
} from "../../store/api/returnRequestApi";
import { Eye, Search, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function AdminReturnRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [updating, setUpdating] = useState(false);
    const { showToast } = useToast();

    const role = getCurrentRoleFromToken();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await getAllReturnRequestsApi();
            setRequests(res?.data?.data || []);
        } catch (err) {
            console.error("Lỗi tải return requests:", err);
            showToast(err?.response?.data?.message || "Không tải được danh sách đổi/trả", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((item) => {
            const q = keyword.trim().toLowerCase();

            const matchKeyword =
                !q ||
                String(item.requestId || "").includes(q) ||
                String(item.orderId || "").includes(q) ||
                String(item.orderItemId || "").includes(q) ||
                (item.reason || "").toLowerCase().includes(q) ||
                (item.description || "").toLowerCase().includes(q);

            const matchStatus =
                statusFilter === "ALL" ? true : item.status === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [requests, keyword, statusFilter]);

    const handleUpdateStatus = async (requestId, newStatus) => {
        const ok = window.confirm(getConfirmText(newStatus));
        if (!ok) return;

        try {
            setUpdating(true);
            const res = await updateReturnRequestStatusApi(requestId, newStatus);
            const updated = res?.data?.data;

            setRequests((prev) =>
                prev.map((item) =>
                    item.requestId === requestId ? { ...item, ...updated } : item
                )
            );

            if (selectedRequest?.requestId === requestId) {
                setSelectedRequest((prev) => ({ ...prev, ...updated }));
            }

            alert("Status updated successfully");
        } catch (err) {
            console.error("Error update status:", err);
            alert(err?.response?.data?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const counts = {
        ALL: requests.length,
        PENDING: requests.filter((r) => r.status === "PENDING").length,
        APPROVED: requests.filter((r) => r.status === "APPROVED").length,
        REJECTED: requests.filter((r) => r.status === "REJECTED").length,
        COMPLETED: requests.filter((r) => r.status === "COMPLETED").length,
    };

    return (
        <div className="p-10 bg-[#f8fafc] min-h-screen">
            <div className="mb-8">
                <h1 className="text-[42px] font-bold text-slate-900">Return Request Management</h1>
                <p className="text-slate-500 text-xl mt-2">
                    Monitor and manage customer return/exchange requests
                </p>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-8">
                {[
                    ["ALL", "All"],
                    ["PENDING", "Pending"],
                    ["APPROVED", "Approved"],
                    ["COMPLETED", "Completed"],
                    ["REJECTED", "Rejected"],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        className={`rounded-2xl border px-6 py-5 text-left transition ${
                            statusFilter === value
                                ? "bg-blue-50 border-blue-400"
                                : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[28px] font-medium text-slate-800">{label}</span>
                            <span className="text-[22px] font-semibold text-slate-500">
                {counts[value]}
              </span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div className="relative w-[420px]">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Search request ID, order ID, reason..."
                            className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-lg outline-none"
                        />
                    </div>

                    <div className="text-lg text-slate-500">
                        Role: <span className="font-semibold text-slate-800">{role || "UNKNOWN"}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 text-slate-500 text-lg">Loading data...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-10 text-slate-500 text-lg">No return requests found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="text-slate-500 text-lg border-b border-slate-100">
                                <th className="text-left px-8 py-5">Request ID</th>
                                <th className="text-left px-8 py-5">Order ID</th>
                                <th className="text-left px-8 py-5">Item ID</th>
                                <th className="text-left px-8 py-5">Reason</th>
                                <th className="text-left px-8 py-5">Status</th>
                                <th className="text-left px-8 py-5">Created At</th>
                                <th className="text-center px-8 py-5">Details</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRequests.map((item) => (
                                <tr
                                    key={item.requestId}
                                    className="border-b border-slate-100 text-[18px] text-slate-800"
                                >
                                    <td className="px-8 py-6 font-semibold">#{item.requestId}</td>
                                    <td className="px-8 py-6">#{item.orderId ?? "N/A"}</td>
                                    <td className="px-8 py-6">#{item.orderItemId ?? "N/A"}</td>
                                    <td className="px-8 py-6 max-w-[320px] truncate">
                                        {item.reason || "-"}
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-8 py-6">{formatDateTime(item.requestedAt)}</td>
                                    <td className="px-8 py-6 text-center">
                                        <button
                                            onClick={() => setSelectedRequest(item)}
                                            className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-300 hover:bg-slate-50"
                                        >
                                            <Eye className="w-5 h-5 text-blue-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedRequest && (
                <ReturnRequestModal
                    item={selectedRequest}
                    role={role}
                    updating={updating}
                    onClose={() => setSelectedRequest(null)}
                    onUpdate={handleUpdateStatus}
                />
            )}
        </div>
    );
}

function ReturnRequestModal({ item, role, updating, onClose, onUpdate }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <h2 className="text-[38px] font-bold text-slate-900">Return Request Details</h2>
                            <StatusBadge status={item.status} />
                        </div>
                        <div className="mt-3 text-slate-500 text-xl">
                            #{item.requestId} • Đơn #{item.orderId} • Item #{item.orderItemId ?? "N/A"}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <div className="grid grid-cols-2">
                    <div className="p-8 border-r border-slate-200">
                        <h3 className="text-[28px] font-semibold text-slate-900 mb-6">Request Information</h3>

                        <div className="space-y-5 text-[20px]">
                            <div>
                                <div className="text-slate-500 mb-1">Reason</div>
                                <div className="font-medium text-slate-900">{item.reason || "-"}</div>
                            </div>

                            <div>
                                <div className="text-slate-500 mb-1">Detailed Description</div>
                                <div className="font-medium text-slate-900 whitespace-pre-line">
                                    {item.description || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-slate-500 mb-1">Image</div>
                                <div className="font-medium text-slate-900">
                                    {item.imageUrl ? (
                                        <a
                                            href={item.imageUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            View Image
                                        </a>
                                    ) : (
                                        "No image"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="text-[28px] font-semibold text-slate-900 mb-6">Process Request</h3>

                        <div className="space-y-5 text-[20px] mb-8">
                            <div>
                                <div className="text-slate-500 mb-1">Created At</div>
                                <div className="font-medium text-slate-900">{formatDateTime(item.requestedAt)}</div>
                            </div>

                            <div>
                                <div className="text-slate-500 mb-1">Resolved At</div>
                                <div className="font-medium text-slate-900">
                                    {item.resolvedAt ? formatDateTime(item.resolvedAt) : "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-slate-500 mb-1">Current Role</div>
                                <div className="font-medium text-slate-900">{role || "UNKNOWN"}</div>
                            </div>
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            {item.status === "PENDING" &&
                                (role === "ADMIN" || role === "OPERATIONAL_STAFF") && (
                                    <>
                                        <button
                                            disabled={updating}
                                            onClick={() => onUpdate(item.requestId, "APPROVED")}
                                            className="px-6 py-4 rounded-2xl bg-blue-600 text-white text-lg font-semibold"
                                        >
                                            Approve
                                        </button>

                                        <button
                                            disabled={updating}
                                            onClick={() => onUpdate(item.requestId, "REJECTED")}
                                            className="px-6 py-4 rounded-2xl bg-red-600 text-white text-lg font-semibold"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl border border-slate-300 text-slate-700 text-lg font-medium hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: "bg-yellow-50 text-yellow-700 border-yellow-300",
        APPROVED: "bg-blue-50 text-blue-700 border-blue-300",
        REJECTED: "bg-red-50 text-red-700 border-red-300",
        COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-300",
    };

    return (
        <span
            className={`inline-flex items-center px-4 py-2 rounded-full border text-lg font-medium ${
                styles[status] || "bg-slate-50 text-slate-700 border-slate-300"
            }`}
        >
      {status}
    </span>
    );
}

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("vi-VN");
}

function getConfirmText(status) {
    switch (status) {
        case "APPROVED":
            return "Are you sure you want to approve this request?";
        case "REJECTED":
            return "Are you sure you want to reject this request?";
        case "COMPLETED":
            return "Are you sure you want to complete this request?";
        default:
            return "Are you sure you want to update the status?";
    }
}

function getCurrentRoleFromToken() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        return payload.role || null;
    } catch (error) {
        console.error("Không đọc được role từ token:", error);
        return null;
    }
}

export default AdminReturnRequest;