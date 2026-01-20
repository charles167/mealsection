import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import { messaging, getToken } from "../config/firebase";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

function Login() {
  const { useFetch } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Request notification permission and get FCM token
  const requestNotificationPermission = async () => {
    try {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches;
      // Safari iOS only supports Web Push for installed PWAs
      if (isIOS && !isStandalone) {
        toast("For notifications on iPhone, add MealSection to Home Screen.");
        return null;
      }

      console.log("👉 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("🔔 Permission result:", permission);

      if (permission !== "granted") {
        console.log("🚫 Permission not granted, skipping token.");
        return null;
      }

      if (!("serviceWorker" in navigator)) {
        console.log("❌ Service workers not supported in this browser.");
        return null;
      }

      // Wait for the service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log("🧾 Service worker ready:", registration);

      const token = await getToken(messaging, {
        vapidKey:
          "BGRrHITgNaK202cuNVMwzxzc_9J8IJloWbYwC0YE2CMQvuYCYJfb-YmwQPueqaZhf8ElJqauT27Uw0z11oHcjMA",
        serviceWorkerRegistration: registration,
      });

      console.log("🎯 FCM token:", token);
      return token || null;
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Get FCM token for push notifications
      const fcmToken = await requestNotificationPermission();

      const { data } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/login`,
        { email, password, fcmToken }, // Send FCM token to backend
        { headers: { "Content-Type": "application/json" } }
      );

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);

      toast.success("Login successful!");
      window.location.replace("/");
      // navigate("/"); // redirect to dashboard or profile
      // useFetch();
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Check your credentials.";
      toast.error(message);

      // Optionally set inline error under inputs
      setErrors({ email: message, password: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 flex flex-col font-sans relative overflow-hidden">
      <SEO
        title={PAGE_SEO.login.title}
        description={PAGE_SEO.login.description}
        keywords={PAGE_SEO.login.keywords}
        noindex={PAGE_SEO.login.noindex}
      />
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-200/20 to-red-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-10 pt-8 flex justify-between items-center">
        <button
          aria-label="Go back"
          className="p-2 rounded-xl hover:bg-white/80 text-gray-700 hover:text-[var(--default)] transition-all duration-300 hover:scale-110"
          onClick={() => navigate(-1)}
        >
          <IoIosArrowRoundBack size={28} />
        </button>
        <h1 className="font-semibold text-gray-800 text-lg">Welcome Back</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-grow max-w-md mx-auto w-full px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex flex-col items-center text-center my-10 animate-fadeIn"
        >
          <div className="rounded-2xl p-2 bg-gradient-to-br from-red-100 via-orange-100 to-yellow-50 flex items-center justify-center shadow-inner mb-4">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Brand"
              className="w-45 rounded-[10px] object-contain shadow-sm"
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Your favorite meals delivered
          </p>
        </Link>

        {/* Form Card */}
        <div className="glass rounded-3xl shadow-xl w-full sm:px-8 px-6 py-10 mt-auto mb-8 border border-white/50 animate-scaleIn">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-500 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email or Phone
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full placeholder:text-[12px] rounded-[10px] border-1 border-gray-200 bg-gray-50/50 px-4 py-3 pl-10 text-sm focus:border-[var(--default)] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300"
                  placeholder="Enter your email or phone"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fadeIn">
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full placeholder:text-[12px] rounded-[10px] border-1 border-gray-200 bg-gray-50/50 py-3 px-4 pl-10 text-sm focus:border-[var(--default)] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300"
                  placeholder="Enter your password"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1 animate-fadeIn">
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 placeholder:text-[12px] text-[var(--default)] border-gray-300 rounded focus:ring-2 focus:ring-[var(--default)] cursor-pointer"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember Me
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="font-medium text-[12px] text-[var(--default)] hover:text-[var(--primary-dark)] hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </span>
              ) : (
                "Login"
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-semibold text-[var(--default)] hover:text-[var(--primary-dark)] hover:underline transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
