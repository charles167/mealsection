import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { FiDownload } from "react-icons/fi";
import { GoUpload } from "react-icons/go";
import { MdOutlineClose } from "react-icons/md";
import { PaystackButton } from "react-paystack";
import toast from "react-hot-toast";
import InputField from "../components/InputField";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiArrowDownTray, HiMiniQrCode } from "react-icons/hi2";
import { TbTransfer } from "react-icons/tb";
import { RiExchangeDollarLine } from "react-icons/ri";
import { LuSparkles } from "react-icons/lu";
import { CiCreditCard1 } from "react-icons/ci";
import SEO from "../components/SEO";
import { PAGE_SEO } from "../utils/seo";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [modal, setModal] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState("all"); // all | in | out
  const [autoTopUp, setAutoTopUp] = useState(false);
  const [spendLimit, setSpendLimit] = useState(0);
  const [successPulse, setSuccessPulse] = useState(false);
  const [loadingTopup, setLoadingTopup] = useState(false);
  const navigate = useNavigate();

  const { user, userFetch } = useAuthContext();
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const email = user?.email;

  // Animated count-up for balance
  const displayBalance = useCountUp(Number(balance || user?.availableBal || 0));

  // Calculate Paystack charge
  const calculatePaystackCharge = (amt) => {
    const amountNum = Number(amt);
    if (isNaN(amountNum) || amountNum <= 0) return 0;
    const percentCharge = amountNum * 0.015;
    const extraFee = amountNum >= 2500 ? 100 : 0;
    return Math.round(percentCharge + extraFee);
  };

  // Only verify payment, do NOT call /add-balance. Wallet will be credited by webhook.
  const handleSuccess = async (reference) => {
    toast.success("Payment successful!");
    setLoadingTopup(true);
    const token = localStorage.getItem("token");
    const userId = user?._id;
    const ref = reference?.reference;
    try {
      // 1. Verify transaction with backend (which should verify with Paystack)
      const verifyRes = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/verify-paystack`,
        { reference: ref, userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (verifyRes.data?.status === "success" || verifyRes.data?.verified) {
        toast.success("Payment verified! Wallet will be credited shortly.");
      } else {
        toast.error("Payment could not be verified. Please contact support.");
      }
    } catch (err) {
      console.error("Paystack verification failed:", err);
      toast.error("Could not verify payment. Please contact support.");
    } finally {
      // Wait a moment for webhook to process, then refresh user balance
      setTimeout(async () => {
        await userFetch();
        setLoadingTopup(false);
        setModal(false);
        setAmount("");
        setSuccessPulse(true);
        setTimeout(() => setSuccessPulse(false), 1200);
      }, 2000);
    }
  };

  // ✅ When payment fails or is cancelled
  const handleClose = () => {
    toast.error("Payment cancelled or failed");
    console.log("Payment closed");
  };

  // Paystack payment configuration
  const charge = calculatePaystackCharge(amount);
  const totalToPay = Number(amount) + charge;
  const componentProps = {
    email,
    amount: totalToPay * 100, // kobo (Paystack works in lowest currency unit)
    publicKey,
    text: `Pay Now (₦${Number(
      amount
    ).toLocaleString()} + ₦${charge} fee = ₦${totalToPay.toLocaleString()})`,
    onSuccess: handleSuccess,
    onClose: handleClose,
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-white">
      <SEO
        title={PAGE_SEO.wallet.title}
        description={PAGE_SEO.wallet.description}
        keywords={PAGE_SEO.wallet.keywords}
      />

      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-400/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-400/20 blur-3xl animate-pulse [animation-delay:400ms]" />

      {/* Header */}
      <div className="relative z-10 sm:p-4 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <IoMdArrowBack size={20} />
          </button>
          <h1 className="text-center text-[18px] sm:text-[20px] font-[700] tracking-tight bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
            Wallet
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <main className="relative z-10 p-5 space-y-6">
        {/* Wallet Card */}
        <div
          className={`relative overflow-hidden rounded-2xl p-[1px] transition-all duration-500 ${
            successPulse ? "ring-2 ring-rose-400/60" : "ring-0"
          } bg-gradient-to-br from-rose-500 to-orange-400`}
        >
          <div className="relative rounded-2xl bg-white/85 backdrop-blur-xl p-4 sm:p-6">
            {/* Accent shimmer */}
            <div className="pointer-events-none absolute -top-6 right-10 h-24 w-24 rotate-12 bg-gradient-to-br from-white/40 to-white/0 blur-xl" />

            {/* Top row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-700">
                <CiCreditCard1 className="h-4 w-4" />
                Premium Wallet
              </div>
              <button
                onClick={() => setShowBalance((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-black/10 transition"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? (
                  <FaRegEyeSlash className="h-3.5 w-3.5" />
                ) : (
                  <FaRegEye className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">
                  {showBalance ? "Hide" : "Show"}
                </span>
              </button>
            </div>

            {/* Balance */}
            <div className="mt-4">
              <p className="text-[12px] text-gray-500">Available Balance</p>
              <div className="mt-1 flex items-end gap-3">
                <p
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight transition-all ${
                    showBalance ? "blur-0" : "blur-sm"
                  }`}
                >
                  ₦{showBalance ? displayBalance.toLocaleString() : "•••••"}
                </p>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                  Active
                </span>
              </div>
            </div>

            {/* Meta & actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[12px] text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium">ID:</span>
                  <button
                    onClick={() => {
                      const id = user?._id || "wallet";
                      navigator.clipboard.writeText(id);
                      toast.success("Wallet ID copied");
                    }}
                    className="rounded-md bg-black/5 px-2 py-1 hover:bg-black/10"
                  >
                    {(user?._id || "wallet").slice(0, 8)}···
                  </button>
                </div>
                <span className="hidden sm:inline">•</span>
                <div>
                  <span className="font-medium">Tier:</span> Basic
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal(true)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2 text-[11px] whitespace-nowrap font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  <RiExchangeDollarLine className="h-4 w-4 transition group-hover:rotate-12" />
                  Add Funds
                </button>
                <button
                  onClick={() => toast("Transfer coming soon")}
                  className="inline-flex items-center gap-2 rounded-xl bg-black/5 px-4 py-2 text-[13px] font-semibold text-gray-800 transition hover:bg-black/10"
                >
                  <TbTransfer className="h-4 w-4" />
                  Send
                </button>
                <button
                  onClick={() => toast("QR receive coming soon")}
                  className="inline-flex items-center gap-2 rounded-xl bg-black/5 px-4 py-2 text-[13px] font-semibold text-gray-800 transition hover:bg-black/10"
                >
                  <HiMiniQrCode className="h-4 w-4" />
                  Receive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Available"
            value={Number(balance || user?.availableBal || 0)}
            tone="emerald"
          />
          <Stat
            label="Spent (30d)"
            value={calcSpent(user?.paymentHistory)}
            tone="rose"
          />
        </div>

        {/* Controls + History */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
            <h2 className="text-base sm:text-lg font-[700] tracking-tight text-gray-800">
              Transactions
            </h2>
            <div className="flex items-center gap-2">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </FilterChip>
              <FilterChip
                active={filter === "in"}
                onClick={() => setFilter("in")}
              >
                In
              </FilterChip>
              <FilterChip
                active={filter === "out"}
                onClick={() => setFilter("out")}
              >
                Out
              </FilterChip>
              <button
                onClick={() =>
                  exportCSV(filteredTx(user?.paymentHistory, filter))
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50"
                aria-label="Export CSV"
              >
                <HiArrowDownTray className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredTx(user?.paymentHistory, filter).length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No transactions yet.
              </div>
            ) : (
              filteredTx(user?.paymentHistory, filter).map((t, i) => (
                <div
                  key={t?._id || i}
                  className="flex items-center justify-between gap-3 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-xl ${
                        t?.type === "in"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {t?.type === "in" ? <FiDownload /> : <GoUpload />}
                    </div>
                    <div>
                      <p className="text-sm font-[600] text-gray-800">
                        {labelForTx(t)}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {formatDate(t?.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-[700] ${
                      t?.type === "out" ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {t?.type === "out" ? "-" : "+"}₦
                    {Number((t?.price ?? t?.amount) || 0).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-[700] text-gray-800">Auto Top-up</h3>
            <p className="mt-1 text-[12px] text-gray-500">
              Automatically top up when balance falls below ₦1,000.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-700">
                Status: {autoTopUp ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={() => setAutoTopUp((v) => !v)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                  autoTopUp ? "bg-emerald-500" : "bg-gray-300"
                }`}
                aria-pressed={autoTopUp}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition ${
                    autoTopUp ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-[700] text-gray-800">
              Monthly Spend Limit
            </h3>
            <p className="mt-1 text-[12px] text-gray-500">
              Get alerts when you near your limit.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/30"
                placeholder="₦10,000"
                value={spendLimit || ""}
                onChange={(e) => setSpendLimit(Number(e.target.value))}
              />
              <div className="text-[12px] text-gray-500">
                Current: ₦{calcSpent(user?.paymentHistory).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Top-up Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-5 shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-400/20 blur-2xl" />
            <button
              onClick={() => setModal(false)}
              className="absolute right-2 top-2 rounded-full p-2 text-gray-600 hover:bg-black/5"
              aria-label="Close"
              disabled={loadingTopup}
            >
              <MdOutlineClose />
            </button>
            <h2 className="text-center text-[16px] font-[700] text-gray-800">
              Wallet Top‑up
            </h2>
            <p className="mt-1 text-center text-[12px] text-gray-500">
              Secure payment via Paystack
            </p>

            <div className="mt-4">
              <label className="text-[12px] text-gray-600">Amount</label>
              <InputField
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loadingTopup}
              />
              <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                {[1000, 2000, 5000, 10000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="rounded-full border border-gray-200 px-3 py-1 font-semibold text-gray-700 hover:bg-gray-50"
                    disabled={loadingTopup}
                  >
                    ₦{v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 min-h-[48px] flex items-center justify-center">
              {loadingTopup ? (
                <div className="flex flex-col items-center w-full">
                  <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-sm text-gray-700">
                    Adding funds to wallet...
                  </span>
                </div>
              ) : amount > 0 ? (
                <PaystackButton
                  {...componentProps}
                  className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 p-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
                />
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl bg-gray-300 p-3 text-sm font-semibold text-white"
                >
                  Enter Amount
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;

// ------- helpers -------
function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-black/5 text-gray-700 hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone = "emerald" }) {
  const tones = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    rose: { bg: "bg-rose-50", text: "text-rose-700" },
  };
  const t = tones[tone] || tones.emerald;
  return (
    <div className={`rounded-xl ${t.bg} p-3`}>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className={`mt-1 text-sm font-[800] ${t.text}`}>
        ₦{Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}

function filteredTx(list = [], filter = "all") {
  if (!Array.isArray(list)) return [];
  if (filter === "all") return list;
  if (filter === "in") return list.filter((t) => t?.type === "in");
  if (filter === "out") return list.filter((t) => t?.type !== "in");
  return list;
}

function labelForTx(t) {
  const id = t?._id ? String(t._id).slice(0, 6) : "000000";
  // ...existing code...
  return t?.type === "in" ? `Top‑up #${id}` : `Order #${id}`;
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "";
  }
}

function calcSpent(list = []) {
  try {
    return list
      ?.filter((t) => t?.type === "out")
      ?.reduce((acc, t) => acc + Number((t?.price ?? t?.amount) || 0), 0);
  } catch {
    return 0;
  }
}

function exportCSV(list = []) {
  const rows = [["id", "type", "amount", "date"]];
  list.forEach((t) => {
    rows.push([
      String(t?._id || "").replaceAll(",", ""),
      t?.type || "",
      String((t?.price ?? t?.amount) || 0),
      formatDate(t?.date),
    ]);
  });
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wallet-transactions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function useCountUp(value, duration = 600) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(0);
  const fromRef = useRef(0);
  const toRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    fromRef.current = display;
    toRef.current = Number(value) || 0;

    const tick = (now) => {
      const p = Math.min(1, (now - startRef.current) / duration);
      const eased = easeOutCubic(p);
      const next = fromRef.current + (toRef.current - fromRef.current) * eased;
      setDisplay(Math.round(next));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return display;
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
