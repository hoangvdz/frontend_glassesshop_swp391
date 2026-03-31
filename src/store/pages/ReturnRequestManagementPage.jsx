import React, { useEffect, useMemo, useState } from "react";
import {
    getAllReturnRequestsApi,
    updateReturnRequestStatusApi,
} from "../api/returnRequestApi";
import { useToast } from "../../context/ToastContext";

function ReturnRequestManagementPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const { showToast } = useToast();

    const role = getCurrentRoleFromToken();

    useEffect(() => {
        fetchReturnRequests();
    }, []);

    const fetchReturnRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await getAllReturnRequestsApi();
            const data = res?.data?.data || [];

            setRequests(data);
        } catch (err) {
            console.error("Lỗi load return requests:", err);
            setError(err?.response?.data?.message || "Không tải được danh sách yêu cầu đổi/trả");
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter((item) => {
            const matchStatus =
                statusFilter === "ALL" ? true : item.status === statusFilter;

            const q = keyword.trim().toLowerCase();
            const matchKeyword =
                !q ||
                String(item.requestId || "").includes(q) ||
                String(item.orderId || "").includes(q) ||
                String(item.orderItemId || "").includes(q) ||
                (item.reason || "").toLowerCase().includes(q) ||
                (item.description || "").toLowerCase().includes(q);

            return matchStatus && matchKeyword;
        });
    }, [requests, keyword, statusFilter]);

    const handleUpdateStatus = async (requestId, newStatus) => {
        let payload = { status: newStatus };

        if (newStatus === "REJECTED") {
            const reason = window.prompt("Nhập lý do từ chối:");

            if (reason === null) return;

            if (!reason.trim()) {
                showToast("Vui lòng nhập lý do từ chối", "error");
                return;
            }

            payload.rejectionReason = reason.trim();
        }

        const confirmText = getConfirmText(newStatus);
        const ok = window.confirm(confirmText);
        if (!ok) return;

        try {
            setUpdatingId(requestId);

            const res = await updateReturnRequestStatusApi(requestId, payload);
            const updated = res?.data?.data;

            setRequests((prev) =>
                prev.map((item) =>
                    item.requestId === requestId ? { ...item, ...updated } : item
                )
            );

            showToast("Cập nhật trạng thái thành công");
        } catch (err) {
            console.error("Lỗi update status:", err);
            const msg = err?.response?.data?.message || "Cập nhật trạng thái thất bại";
            showToast(msg, "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const renderActions = (item) => {
        const isUpdating = updatingId === item.requestId;
        const canHandle = role === "ADMIN" || role === "OPERATIONAL_STAFF";

        // PENDING → cho cả ADMIN + STAFF approve + reject
        if (item.status === "PENDING" && canHandle) {
            return (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleUpdateStatus(item.requestId, "APPROVED")}
                        disabled={isUpdating}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                            isUpdating
                                ? "bg-stone-300 text-white cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        {isUpdating ? "..." : "Đồng ý"}
                    </button>

                    <button
                        onClick={() => handleUpdateStatus(item.requestId, "REJECTED")}
                        disabled={isUpdating}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                            isUpdating
                                ? "bg-stone-300 text-white cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        {isUpdating ? "..." : "Từ chối"}
                    </button>
                </div>
            );
        }

        // APPROVED → cho cả ADMIN + STAFF hoàn tất
        if (item.status === "APPROVED" && canHandle) {
            return (
                <button
                    onClick={() => handleUpdateStatus(item.requestId, "COMPLETED")}
                    disabled={isUpdating}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                        isUpdating
                            ? "bg-stone-300 text-white cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                >
                    {isUpdating ? "..." : "Hoàn tất"}
                </button>
            );
        }

        return <span className="text-stone-400 text-sm">Không có thao tác</span>;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                    <p className="text-stone-500">Đang tải danh sách yêu cầu đổi/trả...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-stone-50 min-h-screen">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm">
                <div className="p-6 border-b border-stone-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-stone-900">
                                Quản lý yêu cầu đổi/trả
                            </h1>
                            <p className="text-stone-500 mt-1">
                                Staff duyệt yêu cầu, Admin từ chối hoặc hoàn tất xử lý
                            </p>
                        </div>

                        <div className="text-sm">
                            <span className="font-semibold text-stone-700">Role hiện tại: </span>
                            <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800">
                {role || "UNKNOWN"}
              </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-stone-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Tìm theo requestId, orderId, reason..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-stone-400"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">PENDING</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <button
                            onClick={fetchReturnRequests}
                            className="px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition"
                        >
                            Tải lại
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="px-6 pt-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                            {error}
                        </div>
                    </div>
                )}

                <div className="p-6 overflow-x-auto">
                    {filteredRequests.length === 0 ? (
                        <div className="text-stone-500">Không có yêu cầu đổi/trả nào.</div>
                    ) : (
                        <table className="w-full min-w-[1100px] border-separate border-spacing-y-3">
                            <thead>
                            <tr className="text-left text-sm text-stone-500">
                                <th className="px-4">Request ID</th>
                                <th className="px-4">Order ID</th>
                                <th className="px-4">Order Item ID</th>
                                <th className="px-4">Lý do</th>
                                <th className="px-4">Mô tả</th>
                                <th className="px-4">Trạng thái</th>
                                <th className="px-4">Ngày tạo</th>
                                <th className="px-4">Ngày xử lý</th>
                                <th className="px-4">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRequests.map((item) => (
                                <tr
                                    key={item.requestId}
                                    className="bg-stone-50 border border-stone-200 rounded-2xl"
                                >
                                    <td className="px-4 py-4 font-semibold text-stone-900">
                                        #{item.requestId}
                                    </td>

                                    <td className="px-4 py-4 text-stone-700">
                                        #{item.orderId ?? "N/A"}
                                    </td>

                                    <td className="px-4 py-4 text-stone-700">
                                        #{item.orderItemId ?? "N/A"}
                                    </td>

                                    <td className="px-4 py-4 text-stone-700 max-w-[220px]">
                                        <div className="line-clamp-2">{item.reason || "-"}</div>
                                    </td>

                                    <td className="px-4 py-4 text-stone-600 max-w-[260px]">
                                        <div className="line-clamp-3">{item.description || "-"}</div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>

                                    <td className="px-4 py-4 text-stone-600 text-sm">
                                        {formatDateTime(item.requestedAt)}
                                    </td>

                                    <td className="px-4 py-4 text-stone-600 text-sm">
                                        {item.resolvedAt ? formatDateTime(item.resolvedAt) : "-"}
                                    </td>

                                    <td className="px-4 py-4">{renderActions(item)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        PENDING: "bg-yellow-100 text-yellow-700",
        APPROVED: "bg-blue-100 text-blue-700",
        REJECTED: "bg-red-100 text-red-700",
        COMPLETED: "bg-emerald-100 text-emerald-700",
    };

    return (
        <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                map[status] || "bg-stone-100 text-stone-700"
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
            return "Bạn có chắc muốn duyệt yêu cầu đổi/trả này?";
        case "REJECTED":
            return "Bạn có chắc muốn từ chối yêu cầu đổi/trả này?";
        case "COMPLETED":
            return "Bạn có chắc muốn hoàn tất yêu cầu đổi/trả này?";
        default:
            return "Bạn có chắc muốn cập nhật trạng thái?";
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

export default ReturnRequestManagementPage;