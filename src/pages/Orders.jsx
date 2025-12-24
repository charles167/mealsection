import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { BiPackage } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useState, useEffect } from "react";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

// A component to display a single order card
function OrderCard({ order }) {
  const navigate = useNavigate();

  // Extract unique vendor names from the packs array
  const vendorNames = [
    ...new Set(order.packs.map((pack) => pack.vendorName).filter(Boolean)),
  ];

  const statusColor =
    order?.currentStatus === "Pending"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : order?.currentStatus === "Cancelled"
      ? "text-red-700 bg-red-50 border-red-200"
      : "text-emerald-700 bg-emerald-50 border-emerald-200";

  const itemCount = order.packs.reduce(
    (sum, pack) => sum + (pack.items?.length || 0),
    0
  );

  return (
    <button
      onClick={() => navigate("/orderdetails", { state: { order } })}
      className="group w-full bg-white/80 backdrop-blur-sm text-start p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:bg-white transition-all duration-300 ease-out"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <BiPackage size={24} className="text-red-500" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Order ID */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">
              #{order._id?.slice(0, 8).toUpperCase()}
            </h3>
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${statusColor}`}
            >
              {order.currentStatus}
            </span>
          </div>

          {/* Vendor Names */}
          {vendorNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {vendorNames.slice(0, 2).map((vendor, idx) => (
                <span
                  key={idx}
                  className="bg-gray-50 text-gray-600 text-[11px] px-2.5 py-1 rounded-md font-normal"
                >
                  {vendor}
                </span>
              ))}
              {vendorNames.length > 2 && (
                <span className="bg-gray-50 text-gray-500 text-[11px] px-2.5 py-1 rounded-md font-normal">
                  +{vendorNames.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Footer - Date and Price */}
          <div className="flex items-center justify-between text-xs">
            <p className="text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-700 font-medium">
              ₦
              {(
                order.subtotal +
                order.serviceFee +
                order.deliveryFee
              ).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Orders() {
  const { orders, orderLoader } = useAuthContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [filteredOrders, setFilteredOrders] = useState([]);

  // ✅ Filter logic
  const ordersToDisplay = filteredOrders?.filter((order) => {
    if (filter === "All") return true;
    if (filter === "Pending") return order.currentStatus === "Pending";
    if (filter === "Delivered") return order.currentStatus === "Delivered";
    if (filter === "Cancelled") return order.currentStatus === "Cancelled";
    return true;
  });

  // Filter orders to display only those matching the userId stored in localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      const userOrders = orders.filter((order) => {
        // order.userId can be a string or an object (populated)
        if (!order.userId) return false;
        if (typeof order.userId === "string") return order.userId === userId;
        if (typeof order.userId === "object" && order.userId._id)
          return order.userId._id === userId;
        return false;
      });
      setFilteredOrders(userOrders);
    }
  }, [orders]);

  if (orderLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mb-4"></div>
        <h3 className="text-base font-medium text-gray-700 mb-1">
          Loading Orders...
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen pb-6">
      <SEO
        title={PAGE_SEO.orders.title}
        description={PAGE_SEO.orders.description}
        keywords={PAGE_SEO.orders.keywords}
      />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all text-gray-600"
          >
            <MdOutlineKeyboardBackspace size={20} />
          </button>
          <div>
            <h2 className="text-lg font-medium text-gray-900">My Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {filteredOrders?.length || 0}{" "}
              {filteredOrders?.length === 1 ? "order" : "orders"} in total
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 px-5 mb-5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter("All")}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            filter === "All"
              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-200"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
          <span
            className={`ml-1.5 ${
              filter === "All" ? "text-white/90" : "text-gray-400"
            }`}
          >
            ({filteredOrders?.length || 0})
          </span>
        </button>

        <button
          onClick={() => setFilter("Pending")}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            filter === "Pending"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-200"
              : "bg-white text-amber-600 border border-amber-200 hover:border-amber-300 hover:bg-amber-50"
          }`}
        >
          Pending
          <span
            className={`ml-1.5 ${
              filter === "Pending" ? "text-white/90" : "text-amber-500"
            }`}
          >
            (
            {filteredOrders?.filter((o) => o.currentStatus === "Pending")
              ?.length || 0}
            )
          </span>
        </button>

        <button
          onClick={() => setFilter("Delivered")}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            filter === "Delivered"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-200"
              : "bg-white text-emerald-600 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
          }`}
        >
          Delivered
          <span
            className={`ml-1.5 ${
              filter === "Delivered" ? "text-white/90" : "text-emerald-500"
            }`}
          >
            (
            {filteredOrders?.filter((o) => o.currentStatus === "Delivered")
              ?.length || 0}
            )
          </span>
        </button>

        <button
          onClick={() => setFilter("Cancelled")}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
            filter === "Cancelled"
              ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-200"
              : "bg-white text-red-600 border border-red-200 hover:border-red-300 hover:bg-red-50"
          }`}
        >
          Cancelled
          <span
            className={`ml-1.5 ${
              filter === "Cancelled" ? "text-white/90" : "text-red-500"
            }`}
          >
            (
            {filteredOrders?.filter((o) => o.currentStatus === "Cancelled")
              ?.length || 0}
            )
          </span>
        </button>
      </div>

      {/* Orders List */}
      <div className="px-5 space-y-3">
        {ordersToDisplay?.length > 0 ? (
          ordersToDisplay.slice().map((order, idx) => (
            <div
              key={order._id}
              className="animate-fadeIn"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <OrderCard order={order} />
            </div>
          ))
        ) : (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <BiPackage size={36} className="text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-700 mb-1">
              No Orders Found
            </h3>
            <p className="text-gray-400 text-sm">
              {filter === "All"
                ? "You haven't placed any orders yet."
                : `No ${filter.toLowerCase()} orders found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
