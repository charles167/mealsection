import React, { useEffect, useMemo, useState } from "react";
import OrderTimeline from "../components/OrderTimeline";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiClock,
  FiCopy,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiShare2,
  FiCreditCard,
  FiPrinter,
  FiTruck,
  FiHome,
  FiUser,
} from "react-icons/fi";
import { MdFastfood } from "react-icons/md";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order;

  // Redirect back if no order provided
  useEffect(() => {
    if (!order) navigate("/orders", { replace: true });
  }, [order, navigate]);

  // Derive key flags from order
  // Processing = all vendors have made a decision (accepted is not null for all packs)
  const allVendorsResponded = useMemo(
    () =>
      (order?.packs || []).length > 0 &&
      (order?.packs || []).every(
        (p) => p?.accepted !== null && p?.accepted !== undefined
      ),
    [order]
  );

  const riderAssigned = useMemo(() => {
    const r = order?.rider;
    if (r == null) return false;
    if (typeof r === "string") {
      const val = r.trim().toLowerCase();
      return val !== "" && val !== "not assigned" && val !== "unassigned";
    }
    return Boolean(r);
  }, [order]);

  const statusLC = String(order?.currentStatus || "").toLowerCase();

  const delivered = statusLC === "delivered";
  const onTheWay = statusLC === "processing";
  const cancelled = statusLC === "cancelled";

  // Fetch assigned rider name when a valid rider is present
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  useEffect(() => {
    const loadRider = async () => {
      try {
        const base = import.meta.env.VITE_REACT_APP_API;
        const res = await fetch(`${base}/api/riders/allRiders`);
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.riders || [];
        const riderId =
          typeof order?.rider === "string" ? order.rider : order?.rider?._id;
        const match = list.find((r) => String(r?._id) === String(riderId));
        setRiderName(match?.userName || "");
        setRiderPhone(match?.phoneNumber || "");
      } catch (err) {
        // Ignore errors, keep fallback label
      }
    };
    if (riderAssigned) loadRider();
  }, [riderAssigned, order]);

  // Build dynamic timeline according to rules:
  // 1. Pending: always marked
  // 2. Processing: when ALL vendors have responded (accepted is not null - either true or false)
  // 3. Rider Assigned: when rider is assigned (not "Not assigned")
  // 4. On the way: when currentStatus is "Processing"
  // 5. Delivered: when currentStatus is "Delivered"
  // 6. If cancelled, only show Pending and Cancelled
  const timelineData = cancelled
    ? [
        { status: "Order placed", time: null, completed: true },
        { status: "Order cancelled", time: null, completed: true },
      ]
    : [
        { status: "Order placed", time: null, completed: true },
        {
          status: "Vendors are checking your order",
          time: null,
          completed: allVendorsResponded,
        },
        {
          status: "Delivery rider found",
          time: null,
          completed: riderAssigned,
        },
        {
          status: "Your food is on the way",
          time: null,
          completed: onTheWay || delivered,
        },
        {
          status: "Order delivered! Enjoy your meal",
          time: null,
          completed: delivered,
        },
      ];

  // Flatten items from packs
  const items = useMemo(() => {
    const list = [];
    (order?.packs || []).forEach((pack) => {
      (pack?.items || []).forEach((it) => {
        list.push({
          id: it._id || `${pack._id}-${it.name}`,
          name: it.name,
          qty: it.quantity,
          price: it.price,
          img: it.image,
          vendorName: it.vendorName || pack.vendorName,
        });
      });
    });
    return list;
  }, [order]);

  const orderId = order?._id?.slice(0, 8).toUpperCase() || "";
  const paymentMethod = order?.paymentMethod || "Wallet";
  const placedAt = order?.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "";
  const deliveryAddress = order?.Address || "";

  const billDetails = useMemo(() => {
    const subtotal =
      typeof order?.subtotal === "number"
        ? order.subtotal
        : items.reduce(
            (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
            0
          );
    const serviceFee =
      typeof order?.serviceFee === "number" ? order.serviceFee : 0;
    const deliveryFee =
      typeof order?.deliveryFee === "number" ? order.deliveryFee : 0;
    return { subtotal, serviceFee, deliveryFee };
  }, [order, items]);

  const total =
    billDetails.subtotal + billDetails.serviceFee + billDetails.deliveryFee;

  // ETA countdown
  const [etaSeconds, setEtaSeconds] = useState(18 * 60);
  useEffect(() => {
    const id = setInterval(
      () => setEtaSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(id);
  }, []);
  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  const completedSteps = timelineData.filter((t) => t.completed).length;
  const progressPct = Math.round((completedSteps / timelineData.length) * 100);

  const headerStatus = delivered
    ? "Order delivered! Enjoy your meal"
    : cancelled
    ? "Order cancelled"
    : onTheWay
    ? "Your food is on the way"
    : riderAssigned
    ? "Delivery rider found"
    : allVendorsResponded
    ? "Vendors are checking your order"
    : "Order placed, waiting for vendors";

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(`#${orderId}`);
      toast.success("Order ID copied");
    } catch {
      toast.error("Unable to copy ID");
    }
  };
  const handlePrint = () => {
    toast("Opening print dialog...");
    window.print();
  };
  const handleShare = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: "MealSection Order",
          text: `Order #${orderId} - ₦${total.toLocaleString()}`,
        });
      } else {
        toast("Share not supported on this device");
      }
    } catch {}
  };

  // format helper removed (using inline formatting)

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 py-4 mb-5">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all text-gray-600">
              <FaArrowLeft size={16} />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-medium text-gray-900">
              Order #{orderId}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{placedAt}</p>
          </div>
          <button
            onClick={copyOrderId}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-700"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 space-y-4">
        {/* ETA / Progress */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <FiTruck size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium">{headerStatus}</p>
              </div>
            </div>
            {onTheWay && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Est. Arrival</p>
                <p className="text-sm font-medium text-gray-700">
                  {etaMin}:{etaSec.toString().padStart(2, "0")}
                </p>
              </div>
            )}
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2.5 text-xs text-gray-500">
            {completedSteps} of {timelineData.length} steps completed
          </p>
        </section>
        {/* Timeline */}
        <OrderTimeline data={timelineData} />

        {/* Rider Details */}
        {riderAssigned ? (
          <section className="bg-gradient-to-br from-white to-gray-50/30 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <FiTruck size={16} className="text-blue-500" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">
                Your Delivery Rider
              </h2>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-full overflow-hidden ring-2 ring-blue-200 ring-offset-2">
                <FiUser size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">
                  {riderName || "Assigned Rider"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {String(order?.rider).slice(0, 8)}…
                </p>
                {riderPhone && (
                  <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                    <FiPhone size={10} /> {riderPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {riderPhone && (
                <a
                  href={`tel:${riderPhone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  <FiPhone size={16} />
                  <span>Call Rider</span>
                </a>
              )}
              <Link
                to="/contact"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-all active:scale-95 ${
                  !riderPhone ? "col-span-2" : ""
                }`}
              >
                <FiMessageCircle size={16} />
                <span>Support</span>
              </Link>
            </div>
          </section>
        ) : (
          <section className="bg-amber-50/50 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-sm p-5">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              Rider Assignment
            </h2>
            <p className="text-xs text-gray-600">
              No rider assigned yet. You'll be notified once a rider is on the
              way.
            </p>
          </section>
        )}

        {/* Delivery Address */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center flex-shrink-0">
              <FiMapPin size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Delivery Address
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {deliveryAddress}
              </p>
            </div>
          </div>
        </section>

        {/* Items - grouped by pack/vendor */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-900 mb-4">Order Items</p>
          <div className="space-y-4">
            {(order?.packs || []).map((pack, packIdx) => {
              const packStatus =
                pack.accepted === true
                  ? "accepted"
                  : pack.accepted === false
                  ? "rejected"
                  : "pending";
              const statusStyles = {
                accepted: "bg-emerald-50 border-emerald-200 text-emerald-700",
                rejected: "bg-red-50 border-red-200 text-red-700",
                pending: "bg-amber-50 border-amber-200 text-amber-700",
              };
              const packStatusLabels = {
                accepted: "✓ Vendor accepted your order",
                rejected: "✗ Vendor couldn't fulfill your order",
                pending: "⏳ Waiting for vendor's response",
              };
              return (
                <div
                  key={pack._id || packIdx}
                  className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-700">
                      {pack.vendorName || pack.name || `Pack ${packIdx + 1}`}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium ${statusStyles[packStatus]}`}
                    >
                      {packStatusLabels[packStatus]}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {(pack.items || []).map((it) => (
                      <div key={it._id} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-orange-100 via-red-50 to-rose-100 flex items-center justify-center">
                              <MdFastfood className="w-5 h-5 text-orange-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {it.name}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Qty: {it.quantity}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          ₦{Number(it.price).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bill Summary */}
        <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Subtotal</span>
              <span className="text-xs text-gray-700">
                ₦{billDetails.subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Service Fee</span>
              <span className="text-xs text-gray-700">
                ₦{billDetails.serviceFee.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Delivery Fee</span>
              <span className="text-xs text-gray-700">
                ₦{billDetails.deliveryFee.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-900">Total</span>
            <span className="text-base font-semibold text-emerald-600">
              ₦{total.toLocaleString()}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <FiCreditCard size={12} /> <span>{paymentMethod}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 flex items-center gap-1.5 transition-all"
            >
              <FiPrinter size={12} /> Print
            </button>
            <Link
              to="/contact"
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 flex items-center gap-1.5 transition-all"
            >
              <FiHome size={12} /> Support
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrderDetails;
