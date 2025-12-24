import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Onboarding() {
  const [university, setUniversity] = useState(
    () => localStorage.getItem("preferredUniversity") || ""
  );
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (!university) {
      toast.error("Please select your university first");
      return;
    }
    localStorage.setItem("preferredUniversity", university);

    // Redirect based on role
    if (role === "rider") {
      window.location.href = "https://rider-admin.mealsection.com";
    } else if (role === "vendor") {
      window.location.href = "https://vendor-admin.mealsection.com";
    } else {
      // Customer goes to login form
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const API = import.meta.env.VITE_REACT_APP_API;
        const { data } = await axios.get(`${API}/api/universities`);
        // Expecting array of universities with name property
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.universities)
          ? data.universities
          : [];
        setUniversities(list);
      } catch (e) {
        toast.error("Failed to load universities");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter((u) =>
      (u.name || u.title || "").toLowerCase().includes(q)
    );
  }, [universities, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 md:px-8 py-4 border-b border-gray-100 bg-white/70 backdrop-blur">
        <img
          src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
          alt="MealSection"
          className="w-32 md:w-36"
        />
      </div>

      {/* Hero */}
      <div className="px-5 md:px-8 mt-6 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
          Choose your university
        </h1>
        <p className="mt-2 text-gray-600 max-w-xl mx-auto text-xs md:text-sm">
          This helps us tailor restaurants, fees and delivery availability to
          your campus.
        </p>
      </div>

      {/* Content card */}
      <div className="flex-1 mt-4 flex items-center justify-center px-5 md:px-8 pb-12">
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for your university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full placeholder:text-[12px] border border-gray-200 rounded-xl px-4 py-2.5 pl-11 text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* University Grid */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {university ? "Selected University" : "Choose Your University"}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No universities found
                </p>
                <p className="text-xs text-gray-400">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filtered.map((u) => (
                  <button
                    key={u._id || u.name}
                    onClick={() => setUniversity(u.name)}
                    className={`group relative text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      university === u.name
                        ? "border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                            university === u.name
                              ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow"
                              : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                          }`}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              university === u.name
                                ? "text-orange-700"
                                : "text-gray-800"
                            }`}
                          >
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {u.location || "Nigeria"}
                          </p>
                        </div>
                      </div>
                      {university === u.name && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={() => handleRoleSelect("customer")}
              className="group relative overflow-hidden px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 hover:border-orange-400 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!university}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Customer</span>
              </div>
            </button>
            <button
              onClick={() => handleRoleSelect("vendor")}
              className="group relative overflow-hidden px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 hover:border-orange-400 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!university}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>Vendor</span>
              </div>
            </button>
            <button
              onClick={() => handleRoleSelect("rider")}
              className="group relative overflow-hidden px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-800 hover:border-orange-400 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!university}
            >
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Rider</span>
              </div>
            </button>
          </div>

          {/* Subtle footnote */}
          <p className="mt-4 text-[11px] text-center text-gray-500">
            You can change this later in Settings.
          </p>
        </div>
      </div>

      {/* Manager Login */}
      <div className="pb-6 text-center">
        <Link
          to="/manager-login"
          className="text-gray-500 text-xs md:text-sm font-medium hover:underline"
        >
          Manager Login
        </Link>
      </div>
    </div>
  );
}

export default Onboarding;
