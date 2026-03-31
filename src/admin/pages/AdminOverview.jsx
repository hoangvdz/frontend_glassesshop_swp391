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
  FiX,
} from "react-icons/fi";

import { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../services/orderService";
import { 
  getCustomerCount, 
  getOrdersCount, 
  getRevenueReport, 
  getDailyRevenue,
  getCancelledOrders
} from "../services/dashboardService";
import { orderStatusData } from "../data/adminMock";

/* ── animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

/* ── chart helpers ── */
const formatChartData = (dailyData) => {
  if (!dailyData || dailyData.length === 0) return { series: [], categories: [] };
  return {
    series: [{ name: "Revenue", data: dailyData.map(d => d.revenue) }],
    categories: dailyData.map(d => {
       const date = new Date(d.day);
       return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" });
    })
  };
};

/* ── stat card config ── */
const statCards = [
  {
    key: "revenue",
    label: "Total Revenue",
    icon: FiDollarSign,
    color: "blue",
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
  },
  {
    key: "orders",
    label: "Orders",
    icon: FiShoppingCart,
    color: "green",
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-100",
  },
  {
    key: "customers",
    label: "Customers",
    icon: FiUsers,
    color: "yellow",
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-100",
    change: "-2.1%",
  },
  {
    key: "growth",
    label: "Growth",
    icon: FiTrendingUp,
    color: "purple",
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-100",
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
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
  shipped: "Shipped",
};

const parseDateVN = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};

function AdminOverview() {
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [filter, setFilter] = useState("7days");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        const toDateObj = new Date(today);
        toDateObj.setDate(today.getDate() + 1); // Include today
        const toDate = formatDate(toDateObj);

        const fromDateObj = new Date(today);
        fromDateObj.setDate(today.getDate() - 7);
        const fromDate = formatDate(fromDateObj);

        // Previous period for growth
        const prevToDate = fromDate;
        const prevFromDateObj = new Date(today);
        prevFromDateObj.setDate(today.getDate() - 14);
        const prevFromDate = formatDate(prevFromDateObj);

        const [
          ordersData,
          ordCount,
          custCount,
          currentRev,
          dailyRev,
          prevRev,
          cancelledData
        ] = await Promise.all([
          getAllOrders(),
          getOrdersCount(),
          getCustomerCount(),
          getRevenueReport(fromDate, toDate),
          getDailyRevenue(fromDate, toDate),
          getRevenueReport(prevFromDate, prevToDate),
          getCancelledOrders(fromDate, toDate)
        ]);

        setOrders(ordersData || []);
        setOrderCount(ordCount || 0);
        setCustomerCount(custCount || 0);
        setTotalRevenue(currentRev?.totalRevenue || 0);
        setDailyData(dailyRev || []);
        setCancelledOrders(cancelledData || []);

        // Calculate growth
        if (prevRev?.totalRevenue > 0) {
          const growth =
            ((currentRev.totalRevenue - prevRev.totalRevenue) /
              prevRev.totalRevenue) *
            100;
          setRevenueGrowth(growth.toFixed(1));
        } else {
          setRevenueGrowth(currentRev?.totalRevenue > 0 ? 100 : 0);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => formatChartData(dailyData), [dailyData]);

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

  const today = new Date().toLocaleDateString("en-US", {
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
            System Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track business performance and orders
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
                {card.key === "orders"
                  ? orderCount.toLocaleString()
                  : card.key === "customers"
                    ? customerCount.toLocaleString()
                    : card.key === "revenue"
                      ? totalRevenue.toLocaleString("vi-VN") + " ₫"
                      : card.key === "growth"
                        ? (revenueGrowth >= 0 ? "+" : "") + revenueGrowth + "%"
                        : "—"}
              </p>
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
                7-Day Revenue
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Daily sales summary
              </p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          <Chart
            type="area"
            height={300}
            series={chartData.series}
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
                categories: chartData.categories,
                labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
              },
              yaxis: {
                labels: {
                  style: { fontSize: "12px", colors: "#9ca3af" },
                  formatter: (v) => v ? v.toLocaleString("vi-VN") : "0",
                },
              },
              grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
              tooltip: {
                y: { formatter: (val) => val ? val.toLocaleString("vi-VN") + " ₫" : "0 ₫" },
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
                Recent Orders
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {recentOrdersFiltered.length} orders
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50"
              >
                <option value="7days">7 days</option>
                <option value="30days">1 month</option>
              </select>

              <Link
                to="/dashboard/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All →
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
              Status Ratio
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Order distribution by status
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
                        label: "Total",
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
                Growth Trend
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Daily revenue fluctuations
              </p>
            </div>
            <button className="text-gray-300 hover:text-gray-500 transition">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          <Chart
            type="line"
            height={280}
            series={chartData.series}
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
                categories: chartData.categories,
                labels: { style: { fontSize: "12px", colors: "#9ca3af" } },
              },
              yaxis: {
                labels: {
                  style: { fontSize: "12px", colors: "#9ca3af" },
                  formatter: (v) => v ? v.toLocaleString("vi-VN") : "0",
                },
              },
              grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
              tooltip: {
                y: { formatter: (val) => val ? val.toLocaleString("vi-VN") + " ₫" : "0 ₫" },
              },
            }}
          />
        </motion.div>
      </section>

      {/* ── CANCELLED ORDERS ── */}
      {cancelledOrders.length > 0 && (
        <section className="mt-10">
          <motion.div
            {...fadeUp(0.35)}
            className="bg-white rounded-3xl border border-red-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-red-800 flex items-center gap-2">
                  <FiX className="text-red-500" /> Cancelled Orders
                </h2>
                <p className="text-xs text-red-400 mt-0.5">
                  Orders that were not successful
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cancelledOrders.map((order, i) => (
                <div key={order.orderId} className="flex items-center justify-between p-4 bg-red-50/30 rounded-2xl border border-red-50 hover:bg-red-50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                        {order.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{order.orderCode}</p>
                        <p className="text-xs text-gray-500">{order.fullName}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{(order.finalPrice || 0).toLocaleString()} ₫</p>
                      <p className="text-[10px] text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default AdminOverview;
