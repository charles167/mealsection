import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Reset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    setNewPasswordError("");
    setConfirmPasswordError("");
    if (!newPassword) {
      setNewPasswordError("Password is required.");
      valid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      valid = false;
    } else if (confirmPassword.length < 6) {
      setConfirmPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else if (
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;
    setLoading(true);
    try {
      const API = import.meta.env.VITE_REACT_APP_API;
      const { data } = await axios.post(
        `${API}/api/users/reset-password/${token}`,
        {
          newPassword,
        }
      );
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl p-0 w-full max-w-md border border-gray-200 shadow-lg z-10 animate-fadeIn overflow-hidden"
        style={{ boxShadow: "0 4px 32px 0 rgba(40,40,40,0.07)" }}
      >
        <div className="flex flex-col items-center pt-8 pb-2">
          <img
            src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
            alt="MealSection Logo"
            className="w-24 mb-2 rounded-lg"
          />
          <h1 className="text-xl font-semibold text-gray-800 mb-1 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-center w-full px-6 text-gray-500 text-[13px] mb-2 font-normal">
            Enter your new password below to secure your account.
          </p>
        </div>
        <div className="px-7 pb-8 pt-0">
          <div className="w-12 h-[2px] mx-auto rounded bg-gray-200 mb-7" />
          {error && (
            <div className="bg-red-50 text-red-700 rounded px-4 py-2 mb-4 text-xs text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 rounded px-4 py-2 mb-4 text-xs text-center font-medium border border-green-100">
              {success}
            </div>
          )}
          <div className="mb-5 relative">
            <label
              htmlFor="newPassword"
              className=" text-[12px] text-gray-500 text-xs font-medium pointer-events-none transition-all placeholder:text-[12px]"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className=" w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--default)] bg-white placeholder:text-[12px] transition-all text-[13px] font-normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              autoComplete="new-password"
            />
            {newPasswordError && (
              <div className="text-xs text-red-600 mt-1 ml-1">
                {newPasswordError}
              </div>
            )}
          </div>
          <div className="mb-8 relative">
            <label
              htmlFor="confirmPassword"
              className=" text-[12px] text-gray-500 text-xs font-medium pointer-events-none transition-all placeholder:text-[12px]"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className=" w-full  border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--default)] bg-white transition-all placeholder:text-[12px] text-[13px] font-normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
            {confirmPasswordError && (
              <div className="text-xs text-red-600 mt-1 ml-1">
                {confirmPasswordError}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--default)] text-white font-semibold py-3 rounded-lg shadow hover:bg-[#a80a0a] transition-all disabled:opacity-60 text-[12px] "
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
