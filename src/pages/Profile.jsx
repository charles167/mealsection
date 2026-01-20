import {
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoNotificationsOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { CiLogin, CiWallet } from "react-icons/ci";
import { BiUser, BiChevronRight, BiGift, BiPackage } from "react-icons/bi";
import { RiHistoryLine, RiCoupon3Line } from "react-icons/ri";
import { MdHelpOutline, MdVerified } from "react-icons/md";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { useAuthContext } from "../context/AuthContext.jsx";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

function ProfileMenuItem({
  icon,
  label,
  link,
  badge,
  subtitle,
  iconBgColor = "from-red-50 to-orange-50",
  iconColor = "text-[var(--default)]",
}) {
  return (
    <Link
      to={link}
      className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div
          className={`bg-gradient-to-br ${iconBgColor} p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300`}
        >
          <span className={`${iconColor} text-lg`}>{icon}</span>
        </div>
        <div>
          <span className="text-gray-800 font-medium text-sm group-hover:text-[var(--default)] transition-colors duration-300 block">
            {label}
          </span>
          {subtitle && (
            <span className="text-xs text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge !== null && (
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        <BiChevronRight
          className="text-gray-400 group-hover:text-[var(--default)] group-hover:translate-x-0.5 transition-all duration-300"
          size={18}
        />
      </div>
    </Link>
  );
}

function Profile() {
  const { user } = useAuthContext();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <SEO
        title={PAGE_SEO.profile.title}
        description={PAGE_SEO.profile.description}
        keywords={PAGE_SEO.profile.keywords}
      />

      <div className="border-b border-gray-200 sticky top-0 z-50 backdrop-blur-xl bg-white/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-gray-700 hover:text-[var(--default)] p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
            >
              <IoArrowBackOutline size={22} />
            </Link>
            <h1 className="text-lg font-bold text-gray-800">Profile</h1>
            <button className="text-gray-700 hover:text-[var(--default)] p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
              <IoSettingsOutline size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Enhanced User Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full -mr-20 -mt-20"></div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="flex items-center justify-center h-20 w-20 bg-gradient-to-br from-[#9e0505] to-[#c91a1a] rounded-2xl shadow-md">
                <BiUser size={40} color="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                <MdVerified size={10} className="text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {user?.fullName || "Guest User"}
                </h2>
                <IoShieldCheckmarkOutline
                  className="text-blue-600"
                  size={18}
                  title="Verified Account"
                />
              </div>
              <p className="text-sm text-gray-500 mb-1">
                {user?.email || "user@example.com"}
              </p>
              <p className="text-xs text-gray-400 flex items-center justify-center sm:justify-start gap-1">
                <HiOutlineLocationMarker size={12} />
                {user?.university || "Campus Location"}
              </p>

              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200/50">
                  <p className="text-[10px] text-green-700 font-semibold mb-0.5 uppercase tracking-wide">
                    Wallet
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    {formatCurrency(user?.availableBal)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border border-blue-200/50">
                  <p className="text-[10px] text-blue-700 font-semibold mb-0.5 uppercase tracking-wide">
                    Orders
                  </p>
                  <p className="text-lg font-bold text-blue-800">
                    {user?.orders?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/wallet"
            className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg mb-2 group-hover:scale-105 transition-transform">
              <CiWallet className="text-green-600 text-2xl" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Top Up</span>
            <span className="text-[10px] text-gray-500">Add funds</span>
          </Link>

          <Link
            to="/referral"
            className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg mb-2 group-hover:scale-105 transition-transform">
              <BiPackage className="text-purple-600 text-2xl" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Orders</span>
            <span className="text-[10px] text-gray-500">Visit Order</span>
          </Link>
        </div>

        {/* Menu Sections with improved spacing */}
        <div className="space-y-3">
          {/* Account Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Account
            </h3>
            <div className="space-y-1">
              <ProfileMenuItem
                icon={<CiWallet />}
                label="Wallet & Payments"
                subtitle="Manage your balance"
                link="/wallet"
                iconBgColor="from-green-50 to-emerald-50"
                iconColor="text-green-600"
              />
              <ProfileMenuItem
                icon={<RiHistoryLine />}
                label="Order History"
                subtitle="Track your orders"
                link="/orders"
                badge={user?.orders?.length || 0}
                iconBgColor="from-blue-50 to-cyan-50"
                iconColor="text-blue-600"
              />
              <ProfileMenuItem
                icon={<RiCoupon3Line />}
                label="Promotions & Offers"
                subtitle="View active deals"
                link="/promotions"
                iconBgColor="from-amber-50 to-yellow-50"
                iconColor="text-amber-600"
              />
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">
              Support
            </h3>
            <div className="space-y-1">
              <ProfileMenuItem
                icon={<MdHelpOutline />}
                label="Help & Support"
                subtitle="Get assistance"
                link="/contact"
                iconBgColor="from-orange-50 to-amber-50"
                iconColor="text-orange-600"
              />
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-start gap-3">
            <IoShieldCheckmarkOutline className="text-blue-600 text-xl mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Your data is secure
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                We use bank-level encryption to protect your personal
                information and payment details. Your privacy is our priority.
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.replace("/login");
            }}
            className="group bg-white border-2 border-gray-200 rounded-xl py-3 px-8 flex items-center gap-2.5 text-gray-700 font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600 hover:shadow-md transition-all duration-300"
          >
            <CiLogin
              className="group-hover:scale-110 transition-transform duration-300"
              size={20}
            />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center pt-4 pb-6 space-y-1">
          <p className="text-gray-400 text-xs">MealSection v1.0.0</p>
          <p className="text-gray-400 text-[10px]">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
