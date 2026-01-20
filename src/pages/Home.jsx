import { useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaStar, FaFire, FaClock } from "react-icons/fa";
import { FiUser, FiTrendingUp } from "react-icons/fi";
import { LuDownload, LuRefreshCw } from "react-icons/lu";
import { useAuthContext } from "../context/AuthContext";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { HiOutlineFire, HiSparkles } from "react-icons/hi";
import { BiDish } from "react-icons/bi";
import { GiShoppingCart } from "react-icons/gi";
import { MdLocalOffer, MdFastfood, MdDeliveryDining } from "react-icons/md";
import { RiTimerFlashLine } from "react-icons/ri";
import { IoGiftOutline } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
import { GoDownload } from "react-icons/go";
import SEO from "../components/SEO";
import { PAGE_SEO, generateStructuredData } from "../utils/seo";

// Simple count-up hook for animated numbers
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function Home() {
  const navigate = useNavigate();
  const { user, vendors, userFetch } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [blur, setBlur] = useState(false);
  const [form, setForm] = useState("");
  const { cart } = useCart();
  const animatedBal = useCountUp(user?.availableBal || 0);
  // Lock vendors to the user's registered university (no manual filter)
  const currentUniversity = user?.university || "";
  const uniFilteredVendors = useMemo(() => {
    if (!vendors) return [];
    // Only vendors with valid === true
    const validVendors = vendors.filter((v) => v.valid === true);
    if (!currentUniversity) return validVendors;
    return validVendors.filter((v) => v.university === currentUniversity);
  }, [vendors, currentUniversity]);

  // Generate structured data for home page
  const structuredData = useMemo(() => generateStructuredData("website"), []);

  // Quick stats with icons
  const quickStats = useMemo(() => {
    const onlineVendors =
      uniFilteredVendors?.filter(
        (v) => String(v.Active).toLowerCase() === "true"
      ).length || 0;
    return [
      {
        label: "Online Vendors",
        value: onlineVendors,
        icon: <HiOutlineFire className="w-5 h-5" />,
        color: "from-green-500 to-emerald-500",
        bg: "bg-green-50",
      },
      {
        label: "Cart Items",
        value: cart?.length || 0,
        icon: <BiDish className="w-5 h-5" />,
        color: "from-purple-500 to-pink-500",
        bg: "bg-purple-50",
      },
      {
        label: "Total Vendors",
        value: uniFilteredVendors?.length || 0,
        icon: <FiTrendingUp className="w-5 h-5" />,
        color: "from-blue-500 to-cyan-500",
        bg: "bg-blue-50",
      },
    ];
  }, [uniFilteredVendors, cart]);

  const quickActions = useMemo(
    () => [
      {
        title: "Flash Deals",
        subtitle: "Up to 50% off",
        icon: <RiTimerFlashLine className="w-6 h-6" />,
        gradient: "from-orange-500 via-red-500 to-pink-500",
        badge: "HOT",
        onClick: () => navigate("/vendors"),
      },
      {
        title: "Fast Delivery",
        subtitle: "Start Ordering Now",
        icon: <MdDeliveryDining className="w-6 h-6" />,
        gradient: "from-blue-500 via-cyan-500 to-teal-500",
        badge: "NEW",
        onClick: () => navigate("/vendors"),
      },
      {
        title: "Quick Bites",
        subtitle: "Ready in 15 min",
        icon: <MdFastfood className="w-6 h-6" />,
        gradient: "from-purple-500 via-pink-500 to-rose-500",
        badge: null,
        onClick: () => navigate("/vendors"),
      },
      {
        title: "Free Gift",
        subtitle: "Stay tuned for mealsection gifts",
        icon: <IoGiftOutline className="w-6 h-6" />,
        gradient: "from-emerald-500 via-green-500 to-teal-500",
        badge: null,
        onClick: () => navigate("/wallet"),
      },
    ],
    [navigate]
  );

  const [promoIndex, setPromoIndex] = useState(0);
  const [promotions, setPromotions] = useState([]);

  // Gradient color options for promos
  const gradientColors = useMemo(
    () => [
      "from-red-500 via-orange-500 to-pink-500",
      "from-purple-500 via-pink-500 to-red-500",
      "from-blue-500 via-cyan-500 to-teal-500",
      "from-emerald-500 via-green-500 to-teal-500",
      "from-orange-500 via-red-500 to-pink-600",
      "from-indigo-500 via-purple-500 to-pink-500",
      "from-yellow-500 via-orange-500 to-red-500",
      "from-teal-500 via-cyan-500 to-blue-500",
    ],
    []
  );

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API
          }/api/promotions?status=active&university=${user?.university || ""}`
        );
        const activePromos = (data?.promotions || []).filter(
          (promo) => promo.status === "active"
        );
        setPromotions(activePromos);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        setPromotions([]);
      }
    };
    if (user?.university) {
      fetchPromotions();
    }
  }, [user?.university]);

  // Map promotions with random colors
  const promos = useMemo(() => {
    return promotions.map((promo, index) => ({
      ...promo,
      color: gradientColors[index % gradientColors.length],
    }));
  }, [promotions, gradientColors]);

  useEffect(() => {
    const id = setInterval(() => {
      setPromoIndex((i) => (i + 1) % promos.length);
    }, 5000);
    return () => clearInterval(id);
  }, [promos.length]);

  const onlineVendors = useMemo(() => {
    if (!uniFilteredVendors) return [];
    return uniFilteredVendors.filter(
      (v) => String(v.Active).toLowerCase() === "true"
    );
  }, [uniFilteredVendors]);

  const newVendors = useMemo(() => {
    if (!uniFilteredVendors) return [];
    return [...uniFilteredVendors]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
  }, [uniFilteredVendors]);

  const shuffledVendors = useMemo(() => {
    if (!uniFilteredVendors) return [];
    return [...uniFilteredVendors].sort(() => Math.random() - 0.5);
  }, [uniFilteredVendors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/20">
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        keywords={PAGE_SEO.home.keywords}
        structuredData={structuredData}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 space-y-6">
        {/* Hero Section - Compact */}
        <div className="grid lg:grid-cols-3 gap-4 animate-fadeIn">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TbTruckDelivery className="w-6 h-6 animate-pulse" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Welcome Back
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                    {user?.fullName
                      ? `Hey ${user.fullName.split(" ")[0]}! 👋`
                      : "Welcome to MealSection"}
                  </h1>
                  <p className="text-white/90 text-sm">
                    {cart?.length
                      ? `${cart.length} item${
                          cart.length === 1 ? "" : "s"
                        } ready to order`
                      : "Discover amazing meals from top vendors"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/profile")}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-sm transition-all"
                >
                  <FiUser size={20} />
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate("/vendors")}
                  className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Browse Vendors
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all"
                >
                  View Cart {cart?.length > 0 && `(${cart.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Card - Compact */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-600">
                Wallet Balance
              </span>
            </div>
            <p
              className={`text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-1 ${
                blur && "blur-sm select-none"
              }`}
            >
              ₦{(animatedBal || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mb-4">Available to spend</p>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/wallet")}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white h-11 rounded-full text-xs font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <LuDownload size={14} />
                Top Up
              </button>
              <button
                onClick={() => setBlur(!blur)}
                className="p-2 h-11 w-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                aria-label={blur ? "Show" : "Hide"}
              >
                {blur ? (
                  <IoEyeOutline size={16} />
                ) : (
                  <IoEyeOffOutline size={16} />
                )}
              </button>
              <button
                onClick={() => userFetch()}
                className="p-2 h-11 w-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                aria-label="Refresh"
              >
                <LuRefreshCw size={16} />
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="p-2 h-11 w-11 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
                aria-label="Refresh"
              >
                <FiUser size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className="grid grid-cols-3 gap-2 animate-fadeIn"
          style={{ animationDelay: "50ms" }}
        >
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}
              >
                <span className="text-white">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs whitespace-nowrap text-gray-500 mt-1 ">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search Bar - Compact */}
        <div
          className="relative animate-fadeIn"
          style={{ animationDelay: "100ms" }}
        >
          <input
            type="text"
            value={form}
            onChange={(e) => {
              setForm(e.target.value);
              setOpen(e.target.value.length > 0);
            }}
            placeholder="Search vendors, meals, or cuisines..."
            className="w-full placeholder:text-[12px] bg-white border border-gray-200 rounded-2xl px-5 py-3 pl-11 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all shadow-sm"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
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
          {form && (
            <button
              onClick={() => {
                setForm("");
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold"
            >
              ×
            </button>
          )}

          {/* Search Dropdown */}
          {open && (
            <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-20 border border-gray-100">
              {uniFilteredVendors
                ?.filter((item) =>
                  item?.storeName.toLowerCase().includes(form.toLowerCase())
                )
                .map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 hover:bg-gray-50 p-3 cursor-pointer transition-all first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-50 last:border-0"
                    onClick={() => {
                      navigate(`/vendor/${item._id}`);
                      setForm("");
                      setOpen(false);
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          className="w-full h-full object-cover"
                          alt={item.storeName}
                        />
                      ) : (
                        <HiOutlineFire className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {item.storeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fast delivery • Quality food
                      </p>
                    </div>
                    {String(item.Active).toLowerCase() === "true" ? (
                      <span className="px-2 py-1 bg-green-50 rounded-full text-[10px] font-medium text-green-700">
                        Online
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-50 rounded-full text-[10px] font-medium text-red-700">
                        Offline
                      </span>
                    )}
                  </div>
                ))}
              {uniFilteredVendors?.filter((item) =>
                item.storeName.toLowerCase().includes(form.toLowerCase())
              ).length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No vendors found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* University Filter removed: locked to user's university */}

        {/* Quick Action Cards */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn"
          style={{ animationDelay: "150ms" }}
        >
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              onClick={action.onClick}
              className="relative bg-white rounded-2xl p-4 cursor-pointer hover:shadow-xl transition-all group overflow-hidden border border-gray-100 hover:-translate-y-1"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Badge */}
              {action.badge && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {action.badge}
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <div className="text-white">{action.icon}</div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-gray-800 text-sm mb-0.5 group-hover:text-red-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500">{action.subtitle}</p>

              {/* Arrow */}
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
            </div>
          ))}
        </div>

        {/* Promo Carousel - Compact */}
        {promos.length > 0 && (
          <div
            className="relative animate-fadeIn"
            style={{ animationDelay: "200ms" }}
          >
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700"
                style={{ transform: `translateX(-${promoIndex * 100}%)` }}
              >
                {promos.map((promo, index) => (
                  <div
                    key={promo._id || index}
                    className={`min-w-full bg-gradient-to-r ${promo.color} p-5 relative`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MdLocalOffer className="text-white w-5 h-5" />
                          <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-bold">
                            {promo.duration || "Limited Time"}
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-1">
                          {promo.discount}% OFF
                        </h3>
                        <p className="text-white/90 text-sm mb-1">
                          {promo.header}
                        </p>
                        <p className="text-white/80 text-xs mb-3">
                          {promo.text}
                        </p>
                        <button
                          onClick={() => {
                            const vendorId =
                              typeof promo.vendorId === "object"
                                ? promo.vendorId?._id
                                : promo.vendorId;
                            if (vendorId) {
                              navigate(`/vendor/${vendorId}`);
                            } else {
                              navigate("/vendors");
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-white text-gray-800 text-xs font-semibold hover:shadow-lg transition-all"
                        >
                          Order Now from {promo.vendorName}
                        </button>
                      </div>
                      <img
                        src="https://www.pngmart.com/files/23/Food-PNG-Isolated-Image.png"
                        alt="Food"
                        className="w-24 h-24 object-contain drop-shadow-2xl hidden sm:block"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-3 gap-1.5">
              {promos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPromoIndex(i)}
                  className={`w-2 h-2 rounded-full transition ${
                    promoIndex === i ? "bg-red-600 scale-125" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        {/* New Vendors */}
        {newVendors.length > 0 && (
          <div className="animate-fadeIn" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <GiShoppingCart className="text-purple-500 w-5 h-5" />
              <h2 className="text-xl font-bold text-gray-800">
                Latest Vendors
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {newVendors?.map((vendor) => (
                <div
                  key={vendor._id}
                  onClick={() => navigate(`/vendor/${vendor._id}`)}
                  className="bg-white w-[100%] rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all group border border-gray-100"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {vendor.image ? (
                      <img
                        src={vendor.image}
                        alt={vendor.storeName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <BiDish className="w-8 h-8 text-red-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                        {vendor.storeName}
                      </h3>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[11px] font-bold rounded-full flex-shrink-0">
                        NEW
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaStar color="#fbbf24" size={12} />
                        <span>4.5</span>
                      </div>
                      <span>•</span>
                      <span>15-30 min</span>
                      {String(vendor.Active).toLowerCase() === "true" && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            Online
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0"
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
            </div>
          </div>
        )}

        {/* Online Vendors */}
        <div className="animate-fadeIn" style={{ animationDelay: "250ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaFire className="text-orange-500 w-5 h-5" />
              <h2 className="text-xl font-bold text-gray-800">
                Online Vendors
              </h2>
            </div>
            <button
              onClick={() => navigate("/vendors")}
              className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View All <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {onlineVendors?.map((vendor, i) => (
              <div
                key={vendor._id}
                onClick={() => navigate(`/vendor/${vendor._id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg cursor-pointer transition-all group overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className="relative h-32 bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden flex items-center justify-center">
                  {vendor.image ? (
                    <img
                      src={vendor.image}
                      alt={vendor.storeName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <MdFastfood className="w-10 h-10 text-red-300" />
                      <span className="text-xs text-red-400 font-medium">
                        No Image
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaStar color="#fbbf24" size={12} />
                    <span className="text-xs font-bold">4.5</span>
                  </div>
                  {String(vendor.Active).toLowerCase() === "true" && (
                    <div className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-lg flex items-center gap-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-xs font-bold">
                        Online
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-800 truncate group-hover:text-red-600 transition-colors">
                    {vendor.storeName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <FaClock className="w-3 h-3" />
                    <span>15-30 min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Vendors - Compact Grid */}
        <div className="animate-fadeIn" style={{ animationDelay: "350ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Restaurants</h2>
            <button
              onClick={() => navigate("/vendors")}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              See All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shuffledVendors?.map((vendor) => (
              <div
                key={vendor._id}
                onClick={() => navigate(`/vendor/${vendor._id}`)}
                className="bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-lg transition-all group border border-gray-100"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {vendor.image ? (
                    <img
                      src={vendor.image}
                      alt={vendor.storeName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <MdFastfood className="w-7 h-7 text-red-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-800 truncate group-hover:text-red-600 transition-colors">
                    {vendor.storeName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <FaStar color="#fbbf24" size={11} />
                    <span>4.5</span>
                    <span>•</span>
                    <span>15-30 min</span>
                  </div>
                </div>
                {String(vendor.Active).toLowerCase() === "true" ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-green-700 font-medium text-xs">
                      Online
                    </span>
                  </div>
                ) : (
                  <span className="bg-red-50 rounded-full px-3 py-1 text-red-600 text-[11px] font-medium">
                    Offline
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
