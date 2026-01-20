import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/forgot-password`,
        { email }
      );
      setMessage({
        text: data.message || "Password reset link sent!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-red-50 via-white to-orange-50 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-[#9e0505]/25 to-[#c91a1a]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-orange-200/40 to-red-100/20 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 sm:px-10 pt-8 flex items-center justify-between">
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="group flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoIosArrowRoundBack
            size={34}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-gray-800">
          Password Recovery
        </h1>
        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center mt-6 sm:mt-10 px-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-100 via-orange-100 to-yellow-50 flex items-center justify-center shadow-inner mb-4">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Brand"
              className="w-16 h-16 rounded-xl object-cover shadow-sm"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed">
            Enter the email linked to your account and we will send a secure
            reset link.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative z-10 mt-8 sm:mt-12 max-w-md mx-auto px-6 pb-20 w-full">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl overflow-hidden">
          <form onSubmit={handleReset} className="px-7 sm:px-8 py-8 space-y-6">
            <div>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                placeholder="Enter your email address"
                required
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              {message && (
                <p className="text-green-600 text-xs mt-1">{message.text}</p>
              )}
            </div>
            <div className="space-y-2 text-[10px] text-gray-500 tracking-wide">
              <p>• Link expires in 30 minutes for security.</p>
              <p>• Check spam folder if not received.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Sending..." : "Send Reset Link"}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
            </button>
            <p className="text-center text-xs text-gray-500">
              Remember password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[var(--default)] font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
