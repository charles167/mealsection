import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  CiLogout,
  CiHome,
  CiShoppingCart,
  CiUser,
  CiMail,
} from "react-icons/ci";
import { RiHistoryLine } from "react-icons/ri";
import { useCartContext } from "../context/CartContext";
import { GoHome } from "react-icons/go";
import { FiUser } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";
import { PiPackageLight } from "react-icons/pi";
import { HiSparkles } from "react-icons/hi2";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { packs } = useCartContext();
  const [promotions, setPromotions] = useState([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const totalItems = (packs || []).reduce(
    (sum, pack) => sum + (pack.items?.length || 0),
    0
  );

  const menuItems = [
    { path: "/", label: "Home", icon: <GoHome size={18} /> },
    { path: "/orders", label: "Orders", icon: <PiPackageLight size={18} /> },
    {
      path: "/contact",
      label: "Contact Us",
      icon: <IoMailOutline size={18} />,
    },
    { path: "/profile", label: "Profile", icon: <FiUser size={18} /> },
  ];

  // Fetch promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API}/api/promotions`
        );
        const data = await response.json();
        // Filter only active promotions
        const activePromotions = (data.promotions || []).filter(
          (promo) => promo.status === "active"
        );
        setPromotions(activePromotions);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  // Auto-rotate promotions every 5 seconds
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  const currentPromo = promotions[currentPromoIndex];

  const handlePromoClick = () => {
    if (currentPromo?.vendorId?._id) {
      navigate(`/vendor/${currentPromo.vendorId._id}`);
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Desktop Top Nav (visible on lg and above) */}
      <div className="hidden lg:block w-full sticky top-0 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Logo"
              className="w-32 hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <nav className="flex items-center gap-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--default)]/40 focus-visible:ring-offset-2
                    ${
                      isActive
                        ? "bg-gradient-to-r from-red-50 to-orange-50 text-[var(--default)] border-red-100 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[var(--default)] hover:ring-1 hover:ring-[var(--default)]/10"
                    }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-[var(--default)]"
                        : "text-gray-500 group-hover:text-[var(--default)]"
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="pointer-events-none absolute -bottom-2 left-3 right-3 h-0.5 bg-[var(--default)]/90 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/cart"
            className="ml-3 relative inline-flex items-center justify-center rounded-xl px-3 py-2 text-gray-700 hover:text-[var(--default)] hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--default)]/40"
            aria-label="Open cart"
            title="Cart"
          >
            <CiShoppingCart className="text-2xl" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-bold bg-[var(--default)] text-white flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow z-50 transform transition-all duration-300 ease-out lg:hidden
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link to="/" className="flex-1">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Logo"
              className="w-28 hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-600 hover:text-[var(--default)] transition-all duration-300 group"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col mt-4 px-3.5 space-y-[6px]">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center gap-2 px-3.5 py-2.5 rounded-lg font-medium text-[15px]
                  transition-all duration-300 
                  ${
                    isActive
                      ? "bg-gradient-to-r from-red-50 to-orange-50 text-[var(--default)]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[var(--default)]"
                  }
                `}
                onClick={toggleSidebar}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span
                  className={`
                  ${
                    isActive
                      ? "text-[var(--default)]"
                      : "text-gray-500 group-hover:text-[var(--default)]"
                  }
                  transition-all duration-300 group-hover:scale-110
                `}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-[var(--default)] rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-gray-200" />

        {/* Promotions Section */}
        <div className="px-4 mb-4">
          {promotions.length > 0 && currentPromo ? (
            <div
              onClick={handlePromoClick}
              className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-xl p-4 border border-red-100 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Animated background sparkle */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-200/40 to-orange-200/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              {/* Featured badge */}
              {currentPromo.featured && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <HiSparkles size={10} />
                  <span>Featured</span>
                </div>
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className=" mb-2">
                  <div>
                    <div className="w-fit bg-[var(--default)] whi text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                      {currentPromo.discount}%
                    </div>
                    <h3 className="mt-2 font-bold text-gray-800 text-sm mb-0.5">
                      {currentPromo.header}
                    </h3>
                    <p className="text-[11px] text-gray-600 font-medium">
                      {currentPromo.vendorName}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-700 leading-relaxed mb-3 line-clamp-2">
                  {currentPromo.text}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium">
                    Ends: {new Date(currentPromo.endDate).toLocaleDateString()}
                  </span>
                  <button className="text-xs font-semibold text-[var(--default)] hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                    Shop Now →
                  </button>
                </div>

                {/* Promotion indicators */}
                {promotions.length > 1 && (
                  <div className="flex gap-1.5 mt-3 justify-center">
                    {promotions.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPromoIndex(index);
                        }}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          index === currentPromoIndex
                            ? "w-6 bg-[var(--default)]"
                            : "w-1 bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to promotion ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-1.5 text-sm">
                🎁 No Active Promotions
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Check back later for exciting deals and offers!
              </p>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("token");
              window.location.replace("/login");
            }}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 font-medium text-sm group w-full px-3.5 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-300"
          >
            <CiLogout className="text-xl group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
