import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";

import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCalendar,
  FiMoreHorizontal,
} from "react-icons/fi";

import { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../services/orderService";

import {
  revenueData,
  orderStatusData,
  overviewStats,
} from "../data/adminMock";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

/* ── chart data ── */
const revenueSeries = [
  { name: "Doanh thu", data: revenueData.map((i) => i.revenue) },
];
const revenueCategories = revenueData.map((i) => i.day);

/* ── stat card config ── */
const statCards = [
  {
    label: "Tổng doanh thu",
    icon: FiDollarSign,
    color: "blue",
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
    change: "+12.5%",
    up: true,
    note: "so với tháng trước",
  },
  {
    label: "Đơn hàng",
    icon: FiShoppingCart,
    color: "green",
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-100",
    change: "+8.2%",
    up: true,
    note: "so với tháng trước",
  },
  {
    label: "Khách hàng",
    icon: FiUsers,
    color: "yellow",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-100",
    change: "-2.1%",
    up: false,
    note: "so với tháng trước",
  },
  {
    label: "Tăng trưởng",
    icon: FiTrendingUp,
    color: "purple",
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-100",
    change: "+5.4%",
    up: true,
    note: "so với tháng trước",
  },
];

/* ── order status badge ── */
const statusStyle = {
  completed: "bg-green-50 text-green-700",
  pending: "bg-yellow-50 text-yellow-700",
  cancelled: "bg-red-50 text-red-700",
  shipped: "bg-blue-50 text-blue-700",
};

const statusText = {
  completed: "Hoàn thành",
  pending: "Chờ xử lý",
  cancelled: "Đã huỷ",
  shipped: "Đang giao",
};

const parseDateVN = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};

function AdminOverview() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("7days"); // mặc định 7 ngày
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        console.log(data);
        setOrders(data);
      } catch (err) {
        console.error("Lỗi lấy orders:", err);
      }
    };

    fetchOrders();
  }, []);

  const recentOrdersFiltered = useMemo(() => {
    const now = new Date();

    const days = filter === "7days" ? 7 : 30;

    return orders
      .filter((order) => {
        if (!order.createdAt) return false;

        const created = parseDateVN(order.createdAt);
        const diffTime = now - created;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays <= days;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // mới nhất trước
      .slice(0, 5); // lấy 5 đơn
  }, [orders, filter]);

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-8 pt-8 pb-16 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      {/* ── TITLE ── */}
      <motion.div
        {...fadeUp(0)}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi hiệu suất kinh doanh và đơn hàng
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2">
          <FiCalendar size={14} />
          <span className="capitalize">{today}</span>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const ChangeIcon = card.up ? FiArrowUpRight : FiArrowDownRight;
          return (
            <motion.div
              key={card.label}
              {...fadeUp(0.05 * i)}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{card.label}</p>
                <div
                  className={`w-11 h-11 flex items-center justify-center rounded-xl ${card.bg} ${card.text} shadow-inner group-hover:scale-110 transition`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <p className="text-2xl font-semibold mt-5 text-gray-800">
                {overviewStats[i]?.value ?? "—"}
              </p>

              {/* Change badge */}
              <div className="flex items-center gap-1.5 mt-3">
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    card.up
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  <ChangeIcon size={11} />
                  {card.change}
                </span>
                <span className="text-xs text-gray-400">{card.note}</span>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── CHART + RECENT ORDERS ── */}
      <section className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart */}
        <motion.div
          {...fadeUp(0.15)}
          className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Doanh thu 7 ngày
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Tổng hợp doanh số theo ngày
              </p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          <Chart
            type="area"
            height={300}
            series={revenueSeries}
            options={{
              chart: {
                toolbar: { show: false },
                zoom: { enabled: false },
                animations: { enabled: true },
              },
              stroke: { curve: "smooth", width: 3 },
              colors: ["#2563eb"],
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.4,
                  opacityTo: 0.05,
                  stops: [0, 90, 100],
                },
              },
              dataLabels: { enabled: false },
              xaxis: {
                categories: revenueCategories,
                labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
              },
              yaxis: {
                labels: {
                  style: { fontSize: "12px", colors: "#9ca3af" },
                  formatter: (v) => v.toLocaleString("vi-VN"),
                },
              },
              grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
              tooltip: {
                y: { formatter: (val) => val.toLocaleString("vi-VN") + " đ" },
              },
            }}
          />
        </motion.div>

        {/* Recent orders */}
        <motion.div
          {...fadeUp(0.2)}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Đơn hàng gần đây
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {recentOrdersFiltered.length} đơn hàng
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50"
              >
                <option value="7days">7 ngày</option>
                <option value="30days">1 tháng</option>
              </select>

              <Link
                to="/dashboard/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Xem tất cả →
              </Link>
            </div>
          </div>

          <div className="space-y-1 flex-1">
            {recentOrdersFiltered.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${order.customer || order.email}&background=1c1917&color=fff&bold=true`}
                    alt={order.customer}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                      {order.customer}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {order.total}
                  </p>
                  {order.status && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle[order.status] ?? "bg-gray-50 text-gray-500"}`}
                    >
                       {statusText[order.status]}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── DONUT + LINE ── */}
      <section className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Donut */}
        <motion.div
          {...fadeUp(0.25)}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="mb-1">
            <h2 className="text-base font-semibold text-gray-800">
              Tỷ lệ trạng thái
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Phân bổ đơn hàng theo trạng thái
            </p>
          </div>

          <Chart
            type="donut"
            height={300}
            series={orderStatusData.map((i) => i.value)}
            options={{
              labels: orderStatusData.map((i) => i.name),
              colors: ["#2563eb", "#22c55e", "#facc15", "#ef4444"],
              stroke: { width: 0 },
              plotOptions: {
                pie: {
                  donut: {
                    size: "65%",
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: "Tổng",
                        fontSize: "13px",
                        color: "#6b7280",
                        formatter: (w) =>
                          w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                      },
                    },
                  },
                },
              },
              legend: { position: "bottom", fontSize: "13px" },
              dataLabels: { enabled: false },
            }}
          />
        </motion.div>

        {/* Line */}
        <motion.div
          {...fadeUp(0.3)}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Xu hướng tăng trưởng
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Biến động doanh thu theo từng ngày
              </p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          <Chart
            type="line"
            height={280}
            series={revenueSeries}
            options={{
              chart: {
                toolbar: { show: false },
                animations: { enabled: true },
              },
              stroke: { curve: "smooth", width: 3 },
              markers: {
                size: 5,
                strokeWidth: 2,
                strokeColors: "#fff",
                hover: { size: 7 },
              },
              colors: ["#22c55e"],
              xaxis: {
                categories: revenueCategories,
                labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
              },
              yaxis: {
                labels: {
                  style: { fontSize: "12px", colors: "#9ca3af" },
                  formatter: (v) => v.toLocaleString("vi-VN"),
                },
              },
              grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
              tooltip: {
                y: { formatter: (val) => val.toLocaleString("vi-VN") + " đ" },
              },
            }}
          />
        </motion.div>
      </section>
    </div>
  );
}

export default AdminOverview;
