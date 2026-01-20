import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { FiSearch, FiClock } from "react-icons/fi";
import {
  MdOutlineContentPasteSearch,
  MdBolt,
  MdStar,
  MdSchool,
} from "react-icons/md";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext.jsx";
import { BiSearch } from "react-icons/bi";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

const PROMO_API = `${import.meta.env.VITE_REACT_APP_API}/api/promotions`;

const gradients = [
  "from-purple-500 to-indigo-500",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-rose-500 to-red-600",
  "from-fuchsia-500 to-pink-500",
];

function timeLeft(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  if (isNaN(diff) || diff <= 0) return "Ends today";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

const Promotions = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active"); // active | featured | myuni
  const [sortBy, setSortBy] = useState("endingSoon"); // endingSoon | newest | discountHigh
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const res = await fetch(PROMO_API);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch promotions");
        const list = Array.isArray(data?.promotions) ? data.promotions : [];
        setPromotions(list);
      } catch (e) {
        console.error(e);
        toast.error("Unable to load promotions");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const filtered = useMemo(() => {
    let list = promotions.filter((p) => p?.status === "active");
    if (tab === "featured") list = list.filter((p) => p?.featured);
    if (tab === "myuni" && user?.university) {
      list = list.filter(
        (p) =>
          (p?.university || "").toLowerCase() === user.university.toLowerCase()
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const vendor = p.vendorName || p.vendorId?.storeName || "";
        return (
          vendor.toLowerCase().includes(q) ||
          (p.header || "").toLowerCase().includes(q) ||
          (p.university || "").toLowerCase().includes(q)
        );
      });
    }
    const toNum = (x) => {
      const n = parseInt(String(x || "").replace(/[^0-9-]/g, ""), 10);
      return Number.isFinite(n) ? n : 0;
    };
    list.sort((a, b) => {
      if (sortBy === "endingSoon") {
        const ea = a.endDate
          ? new Date(a.endDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const eb = b.endDate
          ? new Date(b.endDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        return ea - eb;
      }
      if (sortBy === "newest") {
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return cb - ca;
      }
      if (sortBy === "discountHigh") {
        return toNum(b.discount) - toNum(a.discount);
      }
      return 0;
    });
    return list;
  }, [promotions, search, tab, user?.university, sortBy]);

  const stats = useMemo(() => {
    const active = promotions.filter((p) => p.status === "active");
    const featured = active.filter((p) => p.featured);
    const uni = user?.university
      ? active.filter(
          (p) =>
            (p.university || "").toLowerCase() === user.university.toLowerCase()
        )
      : [];
    return {
      active: active.length,
      featured: featured.length,
      uni: uni.length,
    };
  }, [promotions, user?.university]);

  const handleGoVendor = (p) => {
    const name = encodeURIComponent(
      p.vendorName || p.vendorId?.storeName || "vendor"
    );
    navigate(`/vendor/${name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <SEO
        title={PAGE_SEO.promotions.title}
        description={PAGE_SEO.promotions.description}
        keywords={PAGE_SEO.promotions.keywords}
      />
      {/* Header */}}
      <div className="border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-gray-700 hover:text-[var(--default)] p-2 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Back"
            >
              <IoArrowBackOutline size={22} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800">Promotions</h1>
            <span className="w-6" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        {/* Hero + Filters */}
        <div className="overflow-hidden rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50 via-white to-red-50/50 p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Hot Promotions
              </h2>
              <p className="text-xs text-gray-600 mt-1 truncate">
                Discover fresh campus deals
                {user?.university ? ` for ${user.university}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                  <MdBolt size={12} /> {stats.active} Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                  <MdStar size={12} /> {stats.featured} Featured
                </span>
                {user?.university && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    <MdSchool size={12} /> {stats.uni} in {user.university}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden sm:block w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-red-200/70 blur-2xl opacity-70" />
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all">
              <BiSearch className=" text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vendor, header or university"
                className="placeholder-gray-400 placeholder:text-[12px] bg-transparent w-full focus:outline-none"
              />
            </div>

            {/* Sort Pills */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                Sort By
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("endingSoon")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    sortBy === "endingSoon"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                      : "bg-white/80 border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <FiClock size={12} />
                  Ending Soon
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    sortBy === "newest"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                      : "bg-white/80 border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <MdBolt size={12} />
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("discountHigh")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    sortBy === "discountHigh"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                      : "bg-white/80 border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <MdStar size={12} />
                  Highest Discount
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 sm:flex items-center gap-2">
            <button
              onClick={() => setTab("active")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                tab === "active"
                  ? "bg-orange-500 text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdBolt size={14} /> Active
            </button>
            <button
              onClick={() => setTab("featured")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                tab === "featured"
                  ? "bg-orange-500 text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdStar size={14} /> Featured
            </button>
            <button
              onClick={() => setTab("myuni")}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                tab === "myuni"
                  ? "bg-orange-500 text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MdSchool size={14} /> University
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse"
              >
                <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-10 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MdOutlineContentPasteSearch
              size={40}
              className="text-gray-300 mb-2"
            />
            <p className="text-gray-600 font-medium">No promotions found</p>
            <p className="text-sm text-gray-400">
              Try changing filters or search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((p, idx) => {
              const color = gradients[idx % gradients.length];
              const vendor = p.vendorName || p.vendorId?.storeName || "Vendor";
              const discountLabel = p.discount ? `${p.discount}% Off` : "Promo";
              const duration = p.duration || "Limited time";
              const uni = p.university || "";
              return (
                <div
                  key={p._id}
                  className="group relative overflow-hidden rounded-2xl border border-orange-200/60 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${color}`} />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full blur-2xl opacity-70" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} text-white flex items-center justify-center text-sm font-bold shadow`}
                        >
                          {vendor?.[0]?.toUpperCase() || "V"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {p.header || "Promotion"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {vendor} • {uni}
                          </p>
                        </div>
                      </div>
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gradient-to-br from-amber-500 to-orange-600 text-white px-2 py-0.5 rounded-full shadow">
                          <MdStar size={10} /> Featured
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs text-gray-600 mb-3 ${
                        expanded[p._id] ? "" : "line-clamp-2"
                      }`}
                    >
                      {p.text}
                    </p>
                    {p.text?.length > 80 && (
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [p._id]: !prev[p._id],
                          }))
                        }
                        className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold mb-3"
                      >
                        {expanded[p._id] ? "Show less" : "Read more"}
                      </button>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        {discountLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                        <FiClock size={12} /> {duration} • {timeLeft(p.endDate)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleGoVendor(p)}
                        className="text-[12px] col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white shadow-sm transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Order Now
                      </button>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setExpanded((prev) => ({ ...prev, [p._id]: true }));
                        }}
                        className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
