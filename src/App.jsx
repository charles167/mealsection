import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";
import { HiOutlineMenu } from "react-icons/hi";
import { IoCartOutline } from "react-icons/io5";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";
import Loader from "./pages/Loader";
import { useCartContext } from "./context/CartContext";
import { messaging, onMessage } from "./config/firebase";
import { useNotifications } from "./hooks/useNotifications";

// ✅ Import all pages here
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import MealList from "./pages/MealList";
import MealDetails from "./pages/MealDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Contact from "./pages/Contact";
import ReferralScreen from "./pages/Referral";
import WelcomeScreen from "./pages/WelcomeScreen";
import ResetPassword from "./components/ResetPassword";
import Wallet from "./pages/Wallet";
import Vendor from "./pages/Vendor";
import OrderDetails from "./pages/OrderDetails";
import SplashPage from "./pages/SplashPage";
import Vendors from "./pages/Vendors";
import Promotions from "./pages/Promotions";
import Reset from "./pages/Reset";

function App() {
  const { packs } = useCartContext();
  const { userLoader } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalItems = packs.reduce((sum, pack) => sum + pack.items.length, 0);
  const userId = localStorage.getItem("userId");

  // ✅ Socket-based in-app notifications (reliable fallback for FCM)
  useNotifications(userId);

  // Listen for foreground FCM notifications (if available)
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📬 Foreground notification received:", payload);

      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body || "";

      // Show toast notification
      toast.success(`${title}\n${body}`, {
        duration: 6000,
        icon: "🔔",
      });
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Hide header/footer on some pages
  const hiddenRoutes = [
    !userId && "/",
    "/onboarding",
    "/login",
    "/signup",
    "/cart",
    "/reset-password",
    "/orders",
    "/orderdetails",
    "/wallet",
    "/profile",
    "/promotions",
  ].filter(Boolean);
  // Hide layout for /reset-password and /reset-password/:token
  const isResetPasswordRoute = /^\/reset-password(\/[^/]+)?$/.test(
    location.pathname
  );
  const isHiddenLayout =
    hiddenRoutes.includes(location.pathname) || isResetPasswordRoute;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-orange-50/20">
      {/* Scroll to top on route change */}
      <ScrollToTop />

      {/* Global Loader */}
      <Loader show={!!userLoader} />
      {/* Header */}
      {!isHiddenLayout && (
        <header className="sm:hidden block sticky top-0 z-40 glass border-b border-gray-200/50 backdrop-blur-xl">
          <div className="px-3 py-2 flex justify-between items-center max-w-7xl mx-auto">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl hover:bg-red-50 transition-all duration-300 group"
            >
              <HiOutlineMenu
                size={24}
                className="text-gray-700 group-hover:text-[var(--default)] transition-colors"
              />
            </button>

            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="Logo"
              className="w-36 sm:w-40 hover:scale-105 transition-transform duration-300"
            />

            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-xl hover:bg-red-50 transition-all duration-300 group"
            >
              <IoCartOutline
                size={24}
                className="text-gray-700 group-hover:text-[var(--default)] transition-colors"
              />
              {totalItems > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-[10px] shadow-lg animate-scaleIn">
                  {totalItems}
                </div>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {!isHiddenLayout && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      {/* Main Content */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/referral" element={<ReferralScreen />} />
          <Route path="/splashpage" element={<SplashPage />} />

          <Route path="/reset-password/:token" element={<Reset />} />
          {/* Dynamic Welcome/Home */}
          {userId ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="/" element={<WelcomeScreen />} />
          )}

          {/* Protected Routes (only visible if logged in) */}
          {userId && (
            <>
              <Route path="/meals" element={<MealList />} />
              <Route path="/meals/:id" element={<MealDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/vendor/:id" element={<Vendor />} />

              <Route path="/orderdetails" element={<OrderDetails />} />
            </>
          )}
        </Routes>
      </main>

      {/* Toast Notifications */}
      <Toaster
        toastOptions={{
          style: {
            fontSize: "12px",
            padding: "8px 12px",
          },
          success: { duration: 3000 },
          error: { duration: 3000 },
        }}
      />

      {/* Footer */}
      {!isHiddenLayout && <Footer />}
    </div>
  );
}

export default App;
