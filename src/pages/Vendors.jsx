import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import React, { useState } from "react";
import { IoIosPricetags } from "react-icons/io";
import { FaStar, FaFire, FaRegHeart, FaHeart } from "react-icons/fa";
import { FiUser, FiTrendingUp, FiGrid, FiList } from "react-icons/fi";
import { LuDownload, LuRefreshCw } from "react-icons/lu";
import { HiSparkles } from "react-icons/hi";
import { MdDeliveryDining, MdFastfood, MdNewReleases } from "react-icons/md";
import { useAuthContext } from "../context/AuthContext";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";
function Vendors() {
  const navigate = useNavigate();
  const { user, userFetch, vendors } = useAuthContext();
  const { cart } = useCart();
  const [balance] = useState(50000);
  const [open, setOpen] = useState(false);
  const [blur, setBlur] = useState(false);
  const [form, setForm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("list");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vendor_favorites") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Scope vendors to the user's university
  const uniFilteredVendors = React.useMemo(() => {
    if (!vendors) return [];
    // Only vendors with valid === true
    const validVendors = vendors.filter((v) => v.valid === true);
    const userUni = (user?.university || "").trim().toLowerCase();
    if (!userUni) return validVendors;
    return validVendors.filter(
      (v) => (v.university || "").trim().toLowerCase() === userUni
    );
  }, [vendors, user?.university]);

  const onlineCount =
    uniFilteredVendors?.filter((v) => String(v.Active).toLowerCase() === "true")
      .length || 0;
  const totalCount = uniFilteredVendors?.length || 0;
  const newCount = uniFilteredVendors?.slice(0, 3).length || 0;

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem("vendor_favorites", JSON.stringify(updated));
      return updated;
    });
  }

  const filteredSorted = React.useMemo(() => {
    if (!uniFilteredVendors) return [];
    let list = [...uniFilteredVendors];
    if (filterStatus === "online") {
      list = list.filter((v) => String(v.Active).toLowerCase() === "true");
    } else if (filterStatus === "offline") {
      list = list.filter((v) => String(v.Active).toLowerCase() !== "true");
    } else if (filterStatus === "favorite") {
      list = list.filter((v) => favorites.includes(v._id));
    }
    if (sortBy === "name") {
      list.sort((a, b) => a.storeName.localeCompare(b.storeName));
    } else if (sortBy === "status") {
      list.sort(
        (a, b) =>
          (String(b.Active).toLowerCase() === "true") -
          (String(a.Active).toLowerCase() === "true")
      );
    } else if (sortBy === "new") {
      // assuming original order means newest first already
      list = list.slice(0);
    }
    return list;
  }, [uniFilteredVendors, filterStatus, sortBy, favorites]);

  const quickActions = React.useMemo(
    () => [
      {
        title: "Fast Delivery",
        icon: <MdDeliveryDining className="w-5 h-5" />,
        color: "from-red-500 to-orange-500",
        onClick: () => setSortBy("status"),
        badge: "SPEED",
      },
      {
        title: "New Vendors",
        icon: <MdNewReleases className="w-5 h-5" />,
        color: "from-purple-500 to-pink-500",
        onClick: () => setSortBy("new"),
        badge: "NEW",
      },
      {
        title: "Quick Bites",
        icon: <MdFastfood className="w-5 h-5" />,
        color: "from-blue-500 to-cyan-500",
        onClick: () => setFilterStatus("online"),
      },
      {
        title: "Favorites",
        icon: <FaHeart className="w-5 h-5" />,
        color: "from-rose-500 to-red-500",
        onClick: () => setFilterStatus("favorite"),
        count: favorites.length,
      },
    ],
    [favorites]
  );

  // Show/hide analytics blocks so vendors appear sooner
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-red-50 via-white to-orange-50 overflow-hidden">
      <SEO
        title={PAGE_SEO.vendors.title}
        description={PAGE_SEO.vendors.description}
        keywords={PAGE_SEO.vendors.keywords}
      />
      {/* Enhanced Ambient background shapes */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-[#9e0505]/25 to-[#c91a1a]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-gradient-to-bl from-purple-200/30 to-pink-200/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-orange-200/40 to-red-100/25 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Premium Wallet Balance Card */}
        <div className="glass rounded-3xl p-5 shadow-md border border-white/40 hover:shadow-lg transition-all duration-300 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Wallet Balance
              </p>
              <p
                className={`text-2xl font-bold gradient-text mb-1 ${
                  blur && "blur-sm select-none"
                }`}
              >
                ₦{user?.availableBal.toLocaleString() || 0}.00
              </p>
              <p className="text-xs text-gray-500">Available to spend</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/wallet")}
              className="bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white px-3 py-2.5 rounded-xl font-semibold text-[12px] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LuDownload size={18} />
              <span>Top Up</span>
            </button>

            <button
              onClick={() => setBlur(!blur)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              aria-label={blur ? "Show balance" : "Hide balance"}
            >
              {blur ? (
                <IoEyeOutline size={20} />
              ) : (
                <IoEyeOffOutline size={20} />
              )}
            </button>

            <button
              onClick={() => userFetch()}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all hover:rotate-180"
              aria-label="Refresh"
            >
              <LuRefreshCw size={20} />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="p-2.5 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-xl transition-colors"
              aria-label="Profile"
            >
              <FiUser size={20} className="text-[var(--default)]" />
            </button>
          </div>
        </div>
        {/* Enhanced Search Bar */}
        <div className="relative">
          <div className="group bg-white/95 backdrop-blur-md border-1 border-gray-200 focus-within:border-[var(--default)] focus-within:shadow-lg rounded-2xl flex items-center px-5 py-3.5 shadow-sm  transition-all">
            <svg
              className="w-5 h-5 text-gray-400 group-focus-within:text-[var(--default)] mr-3 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={form}
              onChange={(e) => {
                const value = e.target.value;
                setForm(value);
                setOpen(value.length > 0);
              }}
              placeholder="Search for vendors or meals..."
              className="w-full placeholder:text-[12px] text-sm bg-transparent outline-none text-gray-700"
            />
            {form && (
              <button
                onClick={() => {
                  setForm("");
                  setOpen(false);
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {open && (
            <div className="bg-white/95 backdrop-blur-md absolute mt-3 w-full rounded-2xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto z-20 animate-fadeIn">
              {uniFilteredVendors
                ?.filter((item) =>
                  item.storeName.toLowerCase().includes(form.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 hover:bg-gray-50 p-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors group"
                    onClick={() => {
                      navigate(`/vendor/${item._id}`);
                      setForm("");
                      setOpen(false);
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        alt={item.storeName}
                      />
                    ) : (
                      <MdFastfood className="w-7 h-7 text-red-300" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--default)] transition-colors">
                        {item.storeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fast delivery • Quality food
                      </p>
                    </div>
                    {String(item.Active).toLowerCase() === "true" ? (
                      <span className="px-2 py-1 bg-green-50 rounded-full text-[10px] font-medium text-green-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Online
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-50 rounded-full text-[10px] font-medium text-red-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Offline
                      </span>
                    )}
                    <svg
                      className="w-5 h-5 text-gray-300 group-hover:text-[var(--default)] transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                ))}

              {uniFilteredVendors?.filter((item) =>
                item.storeName.toLowerCase().includes(form.toLowerCase())
              ).length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No vendors found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vendors appear earlier: toggle for insights above list */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Vendors</h2>
          <button
            onClick={() => setShowInsights((s) => !s)}
            className="text-xs px-3 py-2 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 transition"
          >
            {showInsights ? "Hide Insights" : "Show Insights"}
          </button>
        </div>

        {/* Filter & View Controls moved up */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "online", label: "Online" },
              { key: "offline", label: "Offline" },
              { key: "favorite", label: "Favorites" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === f.key
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-gray-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="name">Sort: Name</option>
              <option value="status">Sort: Status</option>
              <option value="new">Sort: New</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl ${
                  viewMode === "grid"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                aria-label="Grid view"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl ${
                  viewMode === "list"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                aria-label="List view"
              >
                <FiList />
              </button>
            </div>
          </div>
        </section>

        {/* All Vendors (Filtered / Sorted) early */}
        <section className="space-y-4 mb-8">
          <span className="text-xs text-gray-500">
            {filteredSorted.length} shown
          </span>
          {filteredSorted.length === 0 && (
            <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-sm text-gray-500">
              No vendors match your filters.
            </div>
          )}
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-3"
            }
          >
            {filteredSorted.map((vendor, idx) => (
              <div
                key={vendor._id}
                className={`group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden animate-fadeIn ${
                  viewMode === "list" ? "flex items-center gap-4 p-4" : "p-0"
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
                onClick={() => navigate(`/vendor/${vendor._id}`)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(vendor._id);
                  }}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:scale-110 transition"
                  aria-label="Toggle favorite"
                >
                  {favorites.includes(vendor._id) ? (
                    <FaHeart className="text-rose-500" />
                  ) : (
                    <FaRegHeart className="text-gray-400" />
                  )}
                </button>
                <div
                  className={
                    viewMode === "list"
                      ? "w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
                      : "relative h-40"
                  }
                >
                  {vendor.image ? (
                    <img
                      src={vendor.image}
                      alt={vendor.storeName}
                      className={
                        viewMode === "list"
                          ? "w-full h-full object-cover group-hover:scale-105 transition-transform"
                          : "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      }
                    />
                  ) : (
                    <MdFastfood className="w-10 h-10 text-red-300 mx-auto my-auto" />
                  )}
                  {String(vendor.Active).toLowerCase() === "true" ? (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      Online
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                      Offline
                    </span>
                  )}
                  {viewMode === "grid" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  )}
                </div>
                <div
                  className={
                    viewMode === "list"
                      ? "flex-1 min-w-0"
                      : "absolute bottom-0 left-0 right-0 p-4 text-white"
                  }
                >
                  <h3
                    className={`font-bold truncate ${
                      viewMode === "list"
                        ? "text-gray-800 mb-1 group-hover:text-red-600 transition-colors"
                        : "text-sm mb-1"
                    }`}
                  >
                    {vendor.storeName}
                  </h3>
                  <p
                    className={`text-xs ${
                      viewMode === "list"
                        ? "text-gray-500 mb-2"
                        : "text-white/80 mb-2"
                    } line-clamp-1`}
                  >
                    Fast delivery • Quality food
                  </p>
                  <div
                    className={`flex items-center gap-2 text-[11px] ${
                      viewMode === "list" ? "text-gray-600" : "text-white/80"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <FaStar
                        className={
                          viewMode === "list"
                            ? "text-yellow-500"
                            : "text-yellow-400"
                        }
                        size={12}
                      />
                      <span className="font-semibold">4.5</span>
                    </div>
                    <span>•</span>
                    <span>10-30 min</span>
                    <span>•</span>
                    <span
                      className={
                        String(vendor.Active).toLowerCase() === "true"
                          ? viewMode === "list"
                            ? "text-green-600 font-semibold flex items-center gap-1"
                            : "text-green-400 font-semibold"
                          : viewMode === "list"
                          ? "text-red-600 font-semibold flex items-center gap-1"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {String(vendor.Active).toLowerCase() === "true"
                        ? "Online"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Insights (Stats & Actions) moved below, toggleable */}
        {showInsights && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Online</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {onlineCount}
                </p>
                <p className="text-[11px] text-gray-500 mt-auto">
                  Active vendors
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Total</span>
                  <FiTrendingUp className="text-blue-500" size={14} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{totalCount}</p>
                <p className="text-[11px] text-gray-500 mt-auto">All vendors</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">New</span>
                  <HiSparkles className="text-purple-500" size={16} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{newCount}</p>
                <p className="text-[11px] text-gray-500 mt-auto">Recent adds</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Favorites</span>
                  <FaHeart className="text-rose-500" size={14} />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {favorites.length}
                </p>
                <p className="text-[11px] text-gray-500 mt-auto">
                  Saved vendors
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((act) => (
                <button
                  key={act.title}
                  onClick={act.onClick}
                  className="relative group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {act.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors flex items-center gap-1">
                    {act.title}
                    {act.count ? (
                      <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full font-bold">
                        {act.count}
                      </span>
                    ) : null}
                    {act.badge && (
                      <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-bold">
                        {act.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Tap to focus</p>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Vendors;
