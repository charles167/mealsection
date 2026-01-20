import { useState, useEffect } from "react";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

import axios from "axios";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

function Message({ message, type }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-md text-white font-medium
        ${type === "error" ? "bg-[var(--default)]" : "bg-green-600"}`}
    >
      {message}
    </div>
  );
}

function Signup() {
  const { useFetch } = useAuthContext;
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    emailOrPhone: "",
    password: "",
    university: "",
    role: "customer",
    profilePicture: null,
  });
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState({});

  const handleStatus = (e) => {
    setChecked(e.target.checked); // true if checked, false if unchecked
  };

  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleFunction = async () => {
    const newErrors = {};

    if (!form.fullName) newErrors.fullName = "Full Name is required";
    if (!form.emailOrPhone) {
      newErrors.emailOrPhone = "Email is required";
    } else {
      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.emailOrPhone)) {
        newErrors.emailOrPhone = "Please enter a valid email address";
      }
    }
    if (!form.password) newErrors.password = "Password is required";
    if (!form.university) newErrors.university = "University is required";
    if (!form.role) newErrors.role = "Role is required";
    if (!checked)
      newErrors.termsAccepted = "You must accept the terms and conditions";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        // Send plain JSON instead of FormData
        const { data } = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API}/api/users/signup`,
          {
            fullName: form.fullName,
            email: form.emailOrPhone,
            password: form.password,
            university: form.university,
            role: form.role,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);

        toast.success("Signup successful!");
        window.location.replace("/");
      } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed");
      } finally {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    const handleFetch = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/universities`
        );
        if (data) {
          setUniversities(data.universities);
        } else {
          toast.error("Error fetching universities. Please reload the page");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching universities");
      }
    };

    handleFetch();
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-red-50 via-white to-orange-50 overflow-hidden">
      <SEO
        title={PAGE_SEO.signup.title}
        description={PAGE_SEO.signup.description}
        keywords={PAGE_SEO.signup.keywords}
        noindex={PAGE_SEO.signup.noindex}
      />
      {/* Ambient background shapes */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-[#9e0505]/20 to-[#c91a1a]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-orange-200/40 to-red-100/20 rounded-full blur-2xl" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 px-6 sm:px-10 pt-8 flex items-center justify-between">
        <button
          aria-label="Go back"
          onClick={() => navigate("/login")}
          className="group flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <IoIosArrowRoundBack
            size={34}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-gray-800">
          Create Account
        </h1>
        <div className="w-12" />
      </div>

      {/* Hero / Branding */}
      <div className="relative z-10 flex flex-col items-center mt-6 sm:mt-10 sm:px-6 px-4">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-2xl p-2 bg-gradient-to-br from-red-100 via-orange-100 to-yellow-50 flex items-center justify-center shadow-inner mb-4">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Brand"
              className="w-45 rounded-[10px] object-contain shadow-sm"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed">
            Join MealSection to explore trusted campus vendors, build smart
            packs and enjoy seamless wallet checkout.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative z-10 mt-8 sm:mt-12 max-w-xl mx-auto px-3 pb-16">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl overflow-hidden">
          <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-6">
            <div className="grid gap-6">
              <div>
                <InputField
                  label="Full Name*"
                  type="text"
                  onChange={handleChange}
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <InputField
                  label="Email*"
                  type="email"
                  onChange={handleChange}
                  name="emailOrPhone"
                  placeholder="Enter your email address"
                  required
                />
                {errors.emailOrPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emailOrPhone}
                  </p>
                )}
              </div>
              <div>
                <InputField
                  label="Password*"
                  type="password"
                  onChange={handleChange}
                  name="password"
                  placeholder="Enter a secure password"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
                {/* Password strength hint (simple heuristic) */}
                {form.password && (
                  <p
                    className={`mt-1 text-[10px] tracking-wide ${
                      form.password.length < 6
                        ? "text-red-500"
                        : form.password.length < 10
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {form.password.length < 6
                      ? "Weak password – add more characters."
                      : form.password.length < 10
                      ? "Medium strength – consider adding numbers & symbols."
                      : "Strong password."}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Your University*
                </label>
                <select
                  id="university"
                  name="university"
                  value={form.university}
                  onChange={handleChange}
                  className="w-full text-[12px] placeholder:text-[12px] rounded-[10px] border-1 border-gray-200 bg-gray-50/50 py-3 px-4 text-sm focus:border-[var(--default)] focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300"
                  required
                >
                  <option value="" disabled>
                    Select your university
                  </option>
                  {universities.map((item) => (
                    <option
                      className="text-[12px]"
                      key={item.name}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.university && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.university}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="profilePicture"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Upload Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[var(--default)] hover:file:bg-red-100"
                />
                {form.profilePicture && (
                  <p className="text-xs text-gray-500 mt-1">
                    File selected: {form.profilePicture.name}
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="termsAccepted"
                  type="checkbox"
                  onChange={handleStatus}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--default)] focus:ring-[var(--default)]"
                />
                <label
                  htmlFor="termsAccepted"
                  className="text-xs sm:text-sm text-gray-600 leading-relaxed"
                >
                  By clicking <span className="font-semibold">Sign Up</span>,
                  you agree to our
                  <a
                    href="#"
                    className="text-[var(--default)] font-medium hover:underline ml-1"
                  >
                    Terms
                  </a>{" "}
                  and
                  <a
                    href="#"
                    className="text-[var(--default)] font-medium hover:underline ml-1"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.termsAccepted}
                </p>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={handleFunction}
                type="button"
                disabled={loading}
                className="group w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3 text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Creating account..." : "Create Account"}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
              </button>
              <p className="text-center text-xs text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-[var(--default)] font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && <Message message={message.text} type={message.type} />}
    </div>
  );
}

export default Signup;
