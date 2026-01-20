import { useState, useEffect } from "react";
import { useCartContext } from "../context/CartContext";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { CgTrash } from "react-icons/cg";
import { BiMinus, BiPlus, BiPackage } from "react-icons/bi";
import {
  MdOutlineLocationOn,
  MdPhone,
  MdLocalShipping,
  MdFastfood,
} from "react-icons/md";
import InputField from "../components/InputField";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CiWarning } from "react-icons/ci";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";
import { useAuthContext } from "../context/AuthContext";
import { MdErrorOutline } from "react-icons/md";
import toast from "react-hot-toast";
import axios from "axios";
function Cart() {
  // Note state
  const [deliveryNote, setDeliveryNote] = useState("");
  const [vendorNote, setVendorNote] = useState("");
  const {
    packs,
    addPack,
    removeFromCart,
    deletePack,
    updateQuantity,
    totalAmount,
    updatePackType,
  } = useCartContext();
  // --- Pack prices state ---
  const [packPrices, setPackPrices] = useState({}); // { vendorId: { smallPackPrice, bigPackPrice } }
  // --- Fetch pack prices for all vendors in cart ---
  useEffect(() => {
    const fetchAllPackPrices = async () => {
      const vendorIds = Array.from(
        new Set(
          packs
            .map((p) => p.vendorId || (p.vendor && p.vendor._id))
            .filter(Boolean),
        ),
      );
      if (vendorIds.length === 0) return;
      try {
        const API = import.meta.env.VITE_REACT_APP_API;
        const results = await Promise.all(
          vendorIds.map((id) =>
            axios
              .get(`${API}/api/pack-prices/${id}`)
              .then((res) => ({
                vendorId: id,
                ...res.data,
              }))
              .catch(() => ({ vendorId: id })),
          ),
        );
        // Build { vendorId: { smallPackPrice, bigPackPrice } }
        const pricesObj = {};
        results.forEach((r) => {
          pricesObj[r.vendorId] = {
            smallPackPrice: r.smallPackPrice || 0,
            bigPackPrice: r.bigPackPrice || 0,
          };
        });
        setPackPrices(pricesObj);
      } catch (err) {
        setPackPrices({});
      }
    };
    fetchAllPackPrices();
  }, [packs]);
  const { user, userFetch } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openPackTypeModal, setOpenPackTypeModal] = useState(false);
  const [packsNeedingType, setPacksNeedingType] = useState([]);
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryFeesData, setDeliveryFeesData] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [savedPhones, setSavedPhones] = useState([]);
  // Service fee is now 10% of subtotal
  // Calculate total pack price
  const totalPackPrice = packs.reduce(
    (sum, pack) => sum + (pack.packPrice || 0),
    0,
  );
  // Service fee logic by subtotal tiers
  // Add selected pack price to subtotal
  let selectedPackPrice = 0;
  if (packs && packs.length) {
    packs.forEach((pack) => {
      if (pack.selected) {
        selectedPackPrice += pack.packPrice || 0;
      }
    });
  }
  const subtotal = totalAmount + totalPackPrice + selectedPackPrice;
  let serviceFeePercent = 0.1;
  if (subtotal <= 999) {
    serviceFeePercent = 0.25;
  } else if (subtotal <= 1999) {
    serviceFeePercent = 0.1;
  } else if (subtotal <= 2999) {
    serviceFeePercent = 0.07;
  } else if (subtotal <= 4999) {
    serviceFeePercent = 0.06;
  } else {
    serviceFeePercent = 0.05;
  }
  const serviceFee = Math.round(subtotal * serviceFeePercent);
  // Fetch delivery fees for all vendors in the cart
  useEffect(() => {
    const fetchDeliveryFees = async () => {
      try {
        const API = import.meta.env.VITE_REACT_APP_API;
        const { data } = await axios.get(`${API}/api/delivery`);
        setDeliveryFeesData(data || []);
      } catch (err) {
        setDeliveryFeesData([]);
      }
    };
    fetchDeliveryFees();
  }, []);

  // Calculate delivery fee range for all packs/vendors
  const [deliveryFeeMin, setDeliveryFeeMin] = useState(0);
  const [deliveryFeeMax, setDeliveryFeeMax] = useState(0);
  useEffect(() => {
    if (!packs.length || !deliveryFeesData.length) {
      setDeliveryFee(0);
      setDeliveryFeeMin(0);
      setDeliveryFeeMax(0);
      return;
    }
    // Get unique vendor IDs from packs
    const vendorIds = Array.from(
      new Set(
        packs
          .map((p) => p.vendorId || (p.vendor && p.vendor._id))
          .filter(Boolean),
      ),
    );
    // For each vendor, find their delivery fee (use min/max)
    let totalMin = 0;
    let totalMax = 0;
    vendorIds.forEach((vid) => {
      const feeObj = deliveryFeesData.find(
        (f) =>
          (f.vendorId && (f.vendorId._id === vid || f.vendorId === vid)) ||
          f.vendorId === vid,
      );
      if (feeObj) {
        totalMin += Number(feeObj.minimumDeliveryFee) || 0;
        totalMax += Number(feeObj.maximumDeliveryFee) || 0;
      }
    });
    setDeliveryFee((prev) =>
      prev < totalMin
        ? totalMin
        : prev > totalMax
          ? totalMax
          : prev || totalMin,
    );
    setDeliveryFeeMin(totalMin);
    setDeliveryFeeMax(totalMax);
  }, [packs, deliveryFeesData]);

  // Fetch active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data } = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API
          }/api/promotions?status=active&university=${user?.university || ""}`,
        );
        // Extract promotions array from response and filter only active ones
        const activePromotions = (data?.promotions || []).filter(
          (promo) => promo.status === "active",
        );
        setPromotions(activePromotions);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        setPromotions([]);
      }
    };
    if (user?.university) {
      fetchPromotions();
    }
  }, [user?.university]);

  // Load saved delivery details on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("deliveryAddress");
    const savedPhone = localStorage.getItem("deliveryPhone");

    // Load saved addresses history
    const addressesHistory = localStorage.getItem("addressesHistory");
    const phonesHistory = localStorage.getItem("phonesHistory");

    if (addressesHistory) {
      setSavedAddresses(JSON.parse(addressesHistory));
    }
    if (phonesHistory) {
      setSavedPhones(JSON.parse(phonesHistory));
    }

    if (savedAddress) setAddressInput(savedAddress);
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);

  // Calculate vendor-specific discounts
  const calculateDiscounts = () => {
    const vendorDiscounts = {};

    packs.forEach((pack) => {
      if (!pack.vendorName && !pack.vendorId) return;

      // Find applicable promotion for this vendor
      const applicablePromo = promotions.find(
        (promo) =>
          (promo.vendorName === pack.vendorName ||
            String(promo.vendorId) === String(pack.vendorId)) &&
          promo.status === "active",
      );

      if (applicablePromo) {
        // Calculate pack total
        const packTotal = pack.items.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0,
        );

        // Calculate discount amount
        const discountPercent = parseFloat(applicablePromo.discount) || 0;
        const discountAmount = (packTotal * discountPercent) / 100;

        const vendorKey = pack.vendorName || pack.vendorId;
        if (!vendorDiscounts[vendorKey]) {
          vendorDiscounts[vendorKey] = {
            vendorName: pack.vendorName,
            discountPercent,
            discountAmount: 0,
            header: applicablePromo.header,
          };
        }
        vendorDiscounts[vendorKey].discountAmount += discountAmount;
      }
    });

    return vendorDiscounts;
  };

  const vendorDiscounts = calculateDiscounts();
  const totalDiscount = Object.values(vendorDiscounts).reduce(
    (sum, v) => sum + v.discountAmount,
    0,
  );
  const grandTotal = Math.round(
    totalAmount + totalPackPrice + serviceFee + deliveryFee - totalDiscount,
  );

  // Save delivery details when they change
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    localStorage.setItem("deliveryAddress", value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    localStorage.setItem("deliveryPhone", value);
  };

  // Save to history when order is placed successfully
  const saveToHistory = () => {
    if (addressInput.trim()) {
      const addressesHistory = JSON.parse(
        localStorage.getItem("addressesHistory") || "[]",
      );
      // Add new address if it's not already in the list
      if (!addressesHistory.includes(addressInput.trim())) {
        const updatedAddresses = [
          addressInput.trim(),
          ...addressesHistory,
        ].slice(0, 5); // Keep only 5 recent
        localStorage.setItem(
          "addressesHistory",
          JSON.stringify(updatedAddresses),
        );
      }
    }

    if (phoneNumber.trim()) {
      const phonesHistory = JSON.parse(
        localStorage.getItem("phonesHistory") || "[]",
      );
      // Add new phone if it's not already in the list
      if (!phonesHistory.includes(phoneNumber.trim())) {
        const updatedPhones = [phoneNumber.trim(), ...phonesHistory].slice(
          0,
          5,
        ); // Keep only 5 recent
        localStorage.setItem("phonesHistory", JSON.stringify(updatedPhones));
      }
    }
  };

  const handleOrder = async () => {
    // Don't set loading immediately - validate first
    // Prevent order if packs, discounts, or delivery fee are not fetched
    if (!packs || packs.length === 0) {
      toast.error("Please add items to your cart before placing an order.");
      return;
    }
    if (!deliveryFeesData || deliveryFeesData.length === 0) {
      toast.error(
        "Delivery fee information is not available. Please wait or refresh.",
      );
      return;
    }
    if (!promotions) {
      toast.error(
        "Discount information is not available. Please wait or refresh.",
      );
      return;
    }
    if (!user?._id) {
      toast.error("You must be logged in to place an order.");
      return;
    } else if (addressInput === "" || phoneNumber === "") {
      toast.error("please input address and PhoneNumber");
      return;
    } else if (isNaN(phoneNumber) || phoneNumber.length < 10) {
      toast.error("Please input a valid phone number");
      return;
    } else {
      // --- Find ALL packs that need packType selection ---
      const packsMissingType = packs.filter(
        (p) =>
          p.vendorId &&
          packPrices[p.vendorId] &&
          p.items.length > 0 &&
          p.items.some(
            (item) =>
              item.category &&
              ["protein", "carbohydrate"].includes(item.category.toLowerCase()),
          ) &&
          !p.packType,
      );

      // ✅ If there are packs needing type, show modal to select all of them
      if (packsMissingType.length > 0) {
        setPacksNeedingType(packsMissingType);
        setOpenPackTypeModal(true);
        return;
      }

      // ✅ Check for sufficient funds BEFORE attempting to process
      // Use grandTotal which already includes discount subtraction
      const requiredFunds = Math.round(grandTotal);
      if (user?.availableBal < requiredFunds) {
        setOpen(false);
        setOpenError(true);
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // ✅ Construct payload
        const subtotalBeforeDiscount = totalAmount + totalPackPrice;
        const subtotalWithDiscount = Math.round(
          subtotalBeforeDiscount - totalDiscount,
        );
        const payload = {
          subtotal: subtotalWithDiscount,
          serviceFee: serviceFee,
          deliveryFee: deliveryFee,
          Address: addressInput,
          PhoneNumber: phoneNumber,
          university: user?.university,
          vendorNote,
          deliveryNote,
          packs: packs.map((p) => ({
            name: p.name,
            vendorName: p.vendorName || null,
            vendorId: p.vendorId || null,
            packType: p.packType || null,
            packPrice: p.packPrice || 0,
            items: p.items.map((i) => ({
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              vendorName: i.vendorName || p.vendorName || null,
              vendorId: i.vendorId || p.vendorId || null,
            })),
          })),
        };

        // 🧾 Log payload before sending
        console.log("📦 Sending Order Payload:", payload);

        // ✅ Send order request
        const { data } = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API}/api/users/add-order`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // 🧩 Log backend response
        console.log("✅ Order Response:", data);
        localStorage.removeItem("packs");
        toast.success("Order placed successfully!");

        // ✅ Update user + UI
        await userFetch(); // refresh balance + orders
        setOpen(false);

        // ✅ Clear cart
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage")); // triggers cart re-render

        window.location.replace("/orders");
      } catch (err) {
        console.error("❌ Order error:", err);
        console.error("📨 Server response:", err.response?.data);
        toast.error(
          err.response?.data?.message || "Failed to place order. Try again.",
        );
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f8] via-[#fff0f0] to-[#fff7f2] relative">
      <SEO
        title={PAGE_SEO.cart.title}
        description={PAGE_SEO.cart.description}
        keywords={PAGE_SEO.cart.keywords}
      />
      {/* Decorative background shapes for visual interest */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[var(--default)]/10 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 right-0 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl z-0" />
      {/* Header */}
      <div className="glass sticky top-0 z-10 border-b border-gray-200/50 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-2 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--default)]"
            aria-label="Go back"
          >
            <IoMdArrowBack size={22} className="text-gray-700" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {packs.length} {packs.length === 1 ? "Pack" : "Packs"}
            </p>
          </div>
          <div className="w-8 sm:w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-2 sm:px-6 py-4 space-y-7 sm:space-y-10 relative z-10">
        {packs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-10 relative overflow-hidden animate-fadeIn">
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(255,215,215,0.5), transparent 60%), radial-gradient(circle at 80% 60%, rgba(255,235,220,0.4), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-red-100 via-orange-100 to-yellow-50 flex items-center justify-center shadow-inner mb-4 sm:mb-6">
                  <BiPackage
                    size={40}
                    className="sm:size-[54px] text-[var(--default)]"
                  />
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-800 mb-2 sm:mb-4">
                  Build Your First Pack
                </h2>
                <p className="text-gray-600 max-w-xl mb-6 sm:mb-8 leading-relaxed text-xs sm:text-base">
                  Packs let you group meals from your favorite vendors for one
                  smooth checkout. Start by exploring vendors, add meals to a
                  new pack, then return here to place your order.
                </p>
              </div>
              {/* Guided Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-7 sm:mb-10">
                {[
                  {
                    id: 1,
                    title: "Choose Vendor",
                    desc: "Browse trusted campus vendors",
                    icon: (
                      <MdLocalShipping
                        size={22}
                        className="sm:size-[26px] text-[var(--default)]"
                      />
                    ),
                  },
                  {
                    id: 2,
                    title: "Add Meals",
                    desc: "Add items into a new pack",
                    icon: (
                      <BiPlus
                        size={22}
                        className="sm:size-[26px] text-[var(--default)]"
                      />
                    ),
                  },
                  {
                    id: 3,
                    title: "Place Order",
                    desc: "Return here to checkout",
                    icon: (
                      <CiWarning
                        size={22}
                        className="sm:size-[26px] text-[var(--default)]"
                      />
                    ),
                  },
                ].map((card) => (
                  <div
                    key={card.id}
                    className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-105 transition-transform">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-0.5 sm:mb-1 text-xs sm:text-sm">
                      {card.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-7 sm:mb-10">
                <button
                  onClick={() => navigate("/vendors")}
                  className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all text-xs sm:text-base"
                >
                  Browse Vendors
                </button>
                <button
                  onClick={() => {
                    addPack();
                    navigate("/vendors");
                  }}
                  className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 bg-white hover:border-[var(--default)] hover:text-[var(--default)] transition-all text-xs sm:text-base"
                >
                  Create First Pack
                </button>
              </div>
              {/* Suggested Vendors Mock */}
              {/* <div className="space-y-2 sm:space-y-4">
                <h4 className="text-xs sm:text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span className="text-lg sm:text-xl">🔥</span> Popular Picks
                  Today
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                  {[
                    {
                      id: 1,
                      name: "Chef's Corner",
                      tag: "Meals",
                      color: "from-red-500 to-orange-500",
                      img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=400&q=60",
                    },
                    {
                      id: 2,
                      name: "Green Bowl",
                      tag: "Healthy",
                      color: "from-emerald-500 to-teal-500",
                      img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=60",
                    },
                    {
                      id: 3,
                      name: "Snack Hub",
                      tag: "Snacks",
                      color: "from-purple-500 to-pink-500",
                      img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=60",
                    },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => navigate("/vendors")}
                      className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all text-left"
                    >
                      <img
                        src={v.img}
                        alt={v.name}
                        className="h-24 sm:h-32 w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                      <div className="absolute bottom-0 p-2 sm:p-3 w-full">
                        <p className="text-[10px] sm:text-xs font-bold tracking-wide text-white/80">
                          {v.tag}
                        </p>
                        <h5 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1">
                          {v.name}
                          <span
                            className={`ml-auto text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r ${v.color} text-white font-medium`}
                          >
                            Open
                          </span>
                        </h5>
                      </div>
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        ) : (
          <>
            {/* Packs */}
            {packs.map((pack, index) => (
              <div
                key={pack.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-white p-1.5 sm:p-2 rounded-xl shadow-sm">
                      <BiPackage
                        size={18}
                        className="sm:size-[20px] text-[var(--default)]"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                        {pack.name}
                      </h2>
                      <p className="text-[10px] sm:text-xs text-gray-600">
                        {pack.items.length}{" "}
                        {pack.items.length === 1 ? "item" : "items"}
                        {pack.vendorName && ` • ${pack.vendorName}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePack(pack.id)}
                    className="text-red-600 hover:bg-red-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Delete Pack
                  </button>
                </div>
                {/* Pack Type Selection UI - Dropdown */}
                {pack.vendorId &&
                  packPrices[pack.vendorId] &&
                  pack.items.some(
                    (item) =>
                      item.category &&
                      ["carbohydrate", "protein"].includes(
                        item.category.toLowerCase(),
                      ),
                  ) && (
                    <div className="px-4 py-2 flex flex-col gap-1">
                      <span className="font-semibold text-gray-700 text-xs mb-1">
                        Choose Pack Type:
                      </span>
                      <div className="flex gap-2">
                        {/* Small Pack Card */}
                        <button
                          type="button"
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg border px-2 py-1 transition-all shadow-sm text-[11px] font-semibold cursor-pointer
                            ${
                              pack.packType === "small"
                                ? "border-[var(--default)] bg-red-50"
                                : "border-gray-200 bg-white hover:border-[var(--default)]"
                            }`}
                          onClick={() =>
                            updatePackType(
                              pack.id,
                              "small",
                              packPrices[pack.vendorId].smallPackPrice,
                            )
                          }
                        >
                          <BiPackage
                            size={16}
                            className="mb-0.5 text-[var(--default)]"
                          />
                          <span>Small Pack</span>
                          <span className="font-bold text-[var(--default)] mt-0.5">
                            ₦{packPrices[pack.vendorId].smallPackPrice}
                          </span>
                          {pack.packType === "small" && (
                            <span className="text-[9px] text-green-600 mt-0.5">
                              Selected
                            </span>
                          )}
                        </button>
                        {/* Big Pack Card */}
                        <button
                          type="button"
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg border px-2 py-1 transition-all shadow-sm text-[11px] font-semibold cursor-pointer
                            ${
                              pack.packType === "big"
                                ? "border-[var(--default)] bg-red-50"
                                : "border-gray-200 bg-white hover:border-[var(--default)]"
                            }`}
                          onClick={() =>
                            updatePackType(
                              pack.id,
                              "big",
                              packPrices[pack.vendorId].bigPackPrice,
                            )
                          }
                        >
                          <BiPackage
                            size={18}
                            className="mb-0.5 text-[var(--default)]"
                          />
                          <span>Big Pack</span>
                          <span className="font-bold text-[var(--default)] mt-0.5">
                            ₦{packPrices[pack.vendorId].bigPackPrice}
                          </span>
                          {pack.packType === "big" && (
                            <span className="text-[9px] text-green-600 mt-0.5">
                              Selected
                            </span>
                          )}
                        </button>
                      </div>
                      {pack.packType && (
                        <span className="ml-1 text-[var(--default)] font-bold text-[11px]">
                          +₦{pack.packPrice} added to total
                        </span>
                      )}
                    </div>
                  )}
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {pack.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 sm:py-10">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <BiPackage
                          size={32}
                          className="sm:size-[48px] text-gray-400"
                        />
                      </div>
                      <h3 className="text-gray-800 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                        {pack.name} is empty
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
                        Add items to continue
                      </p>
                      <button
                        onClick={() => navigate("/vendors")}
                        className="text-[11px] sm:text-[12px] bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    pack.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="w-12 sm:w-20 h-12 sm:h-20 rounded-xl overflow-hidden shadow-sm">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-orange-100 via-red-50 to-rose-100 flex items-center justify-center">
                              <MdFastfood className="w-6 sm:w-8 h-6 sm:h-8 text-orange-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate text-xs sm:text-base">
                            {item.name}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                            {item.vendorName}
                          </p>
                          <p className="text-[var(--default)] font-bold mt-1 sm:mt-2 text-xs sm:text-base">
                            ₦{item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 sm:gap-3">
                          <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, pack.id, -1)
                              }
                              className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                              <BiMinus size={14} className="sm:size-[16px]" />
                            </button>
                            <span className="w-7 sm:w-8 text-center font-semibold text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, pack.id, 1)
                              }
                              className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                              <BiPlus size={14} className="sm:size-[16px]" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, pack.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <CgTrash size={18} className="sm:size-[20px]" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            {/* Add Pack Button */}
            <button
              onClick={addPack}
              className="w-full text-xs sm:text-sm bg-white border-2 border-dashed border-gray-300 hover:border-[var(--default)] text-gray-600 hover:text-[var(--default)] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <BiPlus size={18} className="sm:size-[20px]" />
              <span>Add Another Pack</span>
            </button>
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 space-y-3 sm:space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2 sm:mb-4 text-sm sm:text-base">
                <MdLocalShipping
                  size={20}
                  className="sm:size-[24px] text-[var(--default)]"
                />
                Delivery Details
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <MdOutlineLocationOn size={14} className="sm:size-[16px]" />
                    Delivery Address
                  </label>
                  <InputField
                    type="text"
                    placeholder="Enter your delivery address"
                    value={addressInput}
                    onChange={handleAddressChange}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    <MdPhone size={14} className="sm:size-[16px]" />
                    Phone Number
                  </label>
                  <InputField
                    type="text"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
            </div>
            {/* Notes Box for Vendor & Rider */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mt-4 mb-2 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm sm:text-base">
                <MdFastfood size={18} className="text-[var(--default)]" />
                Add Notes for Vendor & Rider
              </h3>
              <div className="flex flex-col sm:flex-row gap-x-4 gap-y-0">
                <div className="flex-1 mb-4 sm:mb-0">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mr-1">
                      <MdFastfood size={14} className="text-orange-500" />
                    </span>
                    Note to Vendor{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    className="w-full placeholder:text-[12px] text-[12px] rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs sm:text-sm focus:border-[var(--default)] focus:ring-2 focus:ring-red-50 outline-none transition-all duration-300 resize-none min-h-[40px]"
                    placeholder="E.g. Please add extra sauce, no onions, etc."
                    value={vendorNote}
                    onChange={(e) => setVendorNote(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-1">
                      <MdLocalShipping size={14} className="text-blue-500" />
                    </span>
                    Note to Rider{" "}
                    <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    className="w-full placeholder:text-[12px] text-[12px] rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs sm:text-sm focus:border-[var(--default)] focus:ring-2 focus:ring-blue-50 outline-none transition-all duration-300 resize-none min-h-[40px]"
                    placeholder="E.g. Call me when you arrive, deliver to gate, etc."
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[var(--default)]/5 to-orange-50/50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[var(--default)] rounded-full"></span>
                  Order Summary
                </h3>
              </div>

              {/* Price Breakdown */}
              <div className="px-4 sm:px-6 py-4 space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₦{(totalAmount + totalPackPrice).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Service Fee{" "}
                    <span className="text-[10px] text-gray-400">(10%)</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₦{serviceFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>
                {/* Delivery Fee Adjuster */}
                {deliveryFeeMax > deliveryFeeMin && (
                  <div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 sm:p-4 border border-gray-200">
                      <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                        <span>Adjust Delivery Fee</span>
                        <span className="text-[var(--default)] bg-red-50 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs">
                          ₦{deliveryFee}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={deliveryFeeMin}
                        max={deliveryFeeMax}
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                        className="w-full accent-[var(--default)] h-1.5 sm:h-2"
                        style={{
                          background: `linear-gradient(to right, #9e0505 0%, #9e0505 ${
                            ((deliveryFee - deliveryFeeMin) /
                              (deliveryFeeMax - deliveryFeeMin)) *
                            100
                          }%, #e5e7eb ${
                            ((deliveryFee - deliveryFeeMin) /
                              (deliveryFeeMax - deliveryFeeMin)) *
                            100
                          }%, #e5e7eb 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mt-2">
                        <span className="font-medium">
                          Min ₦{deliveryFeeMin}
                        </span>
                        <span className="font-medium">
                          Max ₦{deliveryFeeMax}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Vendor-specific Discounts */}
                {Object.entries(vendorDiscounts).length > 0 && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <span className="text-sm">🎉</span> Active Discounts
                    </p>
                    {Object.entries(vendorDiscounts).map(([key, discount]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center text-xs sm:text-sm mb-2 bg-green-50 px-2 py-1.5 rounded-lg"
                      >
                        <span className="text-green-700 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-green-500"></span>
                          <span className="flex flex-col">
                            <span className="font-medium">
                              {discount.vendorName}
                            </span>
                            <span className="text-[10px] text-green-600">
                              {discount.discountPercent}% off
                            </span>
                          </span>
                        </span>
                        <span className="font-semibold text-green-700">
                          -₦{discount.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/30 px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">
                      Grand Total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--default)]">
                      ₦{grandTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 border border-green-200 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm">
                          Pay with Wallet
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 ml-4">
                        Balance:{" "}
                        <span className="font-bold text-green-600">
                          ₦{user?.availableBal?.toLocaleString() || "0"}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full">
                      <input
                        type="radio"
                        checked
                        readOnly
                        className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 cursor-default"
                      />
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={() => setOpen(true)}
                  className="w-full bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <span>Place Order</span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* //modaldialog? */}
      <Dialog open={open} onClose={setOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-xs sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <BiPackage
                      size={24}
                      className="sm:size-[32px] text-[var(--default)]"
                    />
                  </div>
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Confirm Order?
                  </DialogTitle>
                  <p className="text-gray-600 mb-1 sm:mb-2 text-xs sm:text-base">
                    Place order of{" "}
                    <span className="font-bold text-[var(--default)]">
                      ₦{grandTotal.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={loading}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-xs sm:text-base"
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      {/* //error message  */}
      <Dialog open={openError} onClose={setOpenError} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-xs sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-2 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-full bg-red-50 sm:mx-0">
                    <MdErrorOutline className="text-red-500" />
                  </div>
                  <div className="mt-2 sm:mt-3 text-center sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-xs sm:text-base font-semibold text-gray-900"
                    >
                      Insufficient Funds
                    </DialogTitle>
                    <div className="mt-1 sm:mt-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        You don’t have enough balance to complete this order.
                        Please add funds to your wallet and try again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-8 pb-6 sm:pb-8 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setOpenError(false)}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenError(false);
                    navigate("/wallet");
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white font-semibold rounded-xl hover:shadow-lg transition-all text-xs sm:text-base"
                >
                  Add Funds
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Pack Type Selection Modal - For Multiple Packs */}
      <Dialog
        open={openPackTypeModal}
        onClose={setOpenPackTypeModal}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-xs sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95 max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-white px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <BiPackage
                      size={24}
                      className="sm:size-[32px] text-blue-600"
                    />
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                    Select Pack Type for All
                  </DialogTitle>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                    Choose small or big pack for{" "}
                    <span className="font-bold">{packsNeedingType.length}</span>{" "}
                    pack{packsNeedingType.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Packs List */}
              <div className="px-4 sm:px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
                {packsNeedingType.map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-3 sm:p-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm truncate">
                          {pack.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          {pack.vendorName} • {pack.items.length} item
                          {pack.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {/* Pack Type Options */}
                    <div className="flex gap-2">
                      {/* Small Pack Button */}
                      <button
                        type="button"
                        className={`flex-1 flex flex-col items-center justify-center rounded-lg border px-2 py-2 transition-all shadow-sm text-[10px] sm:text-xs font-semibold cursor-pointer
                          ${
                            pack.packType === "small"
                              ? "border-[var(--default)] bg-red-50"
                              : "border-gray-300 bg-white hover:border-[var(--default)]"
                          }`}
                        onClick={() => {
                          updatePackType(
                            pack.id,
                            "small",
                            packPrices[pack.vendorId].smallPackPrice,
                          );
                          // Update local state
                          setPacksNeedingType((prev) =>
                            prev.map((p) =>
                              p.id === pack.id
                                ? {
                                    ...p,
                                    packType: "small",
                                    packPrice:
                                      packPrices[pack.vendorId].smallPackPrice,
                                  }
                                : p,
                            ),
                          );
                        }}
                      >
                        <BiPackage
                          size={14}
                          className="mb-1 text-[var(--default)]"
                        />
                        <span className="leading-tight">Small</span>
                        <span className="font-bold text-[var(--default)] text-[9px] sm:text-[10px]">
                          ₦{packPrices[pack.vendorId]?.smallPackPrice || 0}
                        </span>
                        {pack.packType === "small" && (
                          <span className="text-[8px] text-green-600 mt-0.5">
                            ✓
                          </span>
                        )}
                      </button>

                      {/* Big Pack Button */}
                      <button
                        type="button"
                        className={`flex-1 flex flex-col items-center justify-center rounded-lg border px-2 py-2 transition-all shadow-sm text-[10px] sm:text-xs font-semibold cursor-pointer
                          ${
                            pack.packType === "big"
                              ? "border-[var(--default)] bg-red-50"
                              : "border-gray-300 bg-white hover:border-[var(--default)]"
                          }`}
                        onClick={() => {
                          updatePackType(
                            pack.id,
                            "big",
                            packPrices[pack.vendorId].bigPackPrice,
                          );
                          // Update local state
                          setPacksNeedingType((prev) =>
                            prev.map((p) =>
                              p.id === pack.id
                                ? {
                                    ...p,
                                    packType: "big",
                                    packPrice:
                                      packPrices[pack.vendorId].bigPackPrice,
                                  }
                                : p,
                            ),
                          );
                        }}
                      >
                        <BiPackage
                          size={16}
                          className="mb-1 text-[var(--default)]"
                        />
                        <span className="leading-tight">Big</span>
                        <span className="font-bold text-[var(--default)] text-[9px] sm:text-[10px]">
                          ₦{packPrices[pack.vendorId]?.bigPackPrice || 0}
                        </span>
                        {pack.packType === "big" && (
                          <span className="text-[8px] text-green-600 mt-0.5">
                            ✓
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-gray-200 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenPackTypeModal(false);
                    setPacksNeedingType([]);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Check if all packs have been assigned a type
                    const allAssigned = packsNeedingType.every(
                      (p) => p.packType,
                    );
                    if (!allAssigned) {
                      toast.error("Please select pack type for all items");
                      return;
                    }
                    setOpenPackTypeModal(false);
                    setPacksNeedingType([]);
                    // Trigger the order placement again
                    setTimeout(() => setOpen(true), 100);
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white font-semibold rounded-xl hover:shadow-lg transition-all text-xs sm:text-base"
                >
                  Continue
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default Cart;
