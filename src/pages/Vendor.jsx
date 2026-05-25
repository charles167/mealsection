import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductsByVendor } from "../services/productService";
import toast from "react-hot-toast";
import { useState, useMemo, useEffect, useRef } from "react";
import { BiPlus } from "react-icons/bi";
import { useCartContext } from "../context/CartContext";
import { useAuthContext } from "../context/AuthContext";
import { IoMdArrowBack } from "react-icons/io";
import { FaRegHeart, FaHeart, FaStar } from "react-icons/fa";
import { LuPackagePlus, LuSparkles } from "react-icons/lu";
import { FiPackage, FiSearch, FiChevronDown } from "react-icons/fi";
import { MdFastfood, MdOutlineSort } from "react-icons/md";
import { GoPackage } from "react-icons/go";
import { TfiPackage } from "react-icons/tfi";
import { IoCheckmark } from "react-icons/io5";
import SEO from "../components/SEO";
import { generateStructuredData, SITE_CONFIG } from "../utils/seo";

function Vendor() {
  // Floating add pack button handler
  const handleFloatingAddPack = () => {
    addPack();
    toast.success("Pack added successfully");
  };
  const { vendors } = useAuthContext();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { packs, addPack, addToCart } = useCartContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular"); // popular | price-asc | price-desc
  const [fav, setFav] = useState(false);
  const vendor = vendors?.find((v) => v._id === id);
  const [selectedPack, setSelectedPack] = useState(packs[0]?.id || "");
  const [adding, setAdding] = useState({}); // per-product add spinner
  const [showPackDropdown, setShowPackDropdown] = useState(false);
  const [displayCount, setDisplayCount] = useState(10); // Initial products to show
  const loaderRef = useRef(null);
  const hasRedirected = useRef(false); // Prevent duplicate redirects
  const [isRedirecting, setIsRedirecting] = useState(false); // Show redirecting loader

  const formattedProducts = (products || []).map((p) => ({
    id: p._id,
    vendorId: p.vendorId,
    name: p.title,
    price: p.price,
    category: p.category,
    available: p.available,
    image: p.image,
    inStock: p.stock === "in",
    vendorName: vendor?.storeName || "", // prevent null
  }));
  // Fetch products for this vendor
  useEffect(() => {
    if (id) {
      setLoadingProducts(true);
      fetchProductsByVendor(id)
        .then((data) => setProducts(data))
        .catch(() => toast.error("Failed to load products"))
        .finally(() => setLoadingProducts(false));
    }
  }, [id]);

  const categories = [
    "All",
    "Protein",
    "Carbohydrate",
    "Drinks",
    "Pastries",
    "Packs",
  ];

  const filteredProducts = useMemo(() => {
    let list = formattedProducts.filter((p) => {
      return (
        String(p.vendorId).trim() === String(id).trim() &&
        (selectedCategory === "All" || p.category === selectedCategory)
      );
    });
    if (query?.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase()?.includes(q));
    }
    if (sort === "price-asc") list = list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = list.sort((a, b) => b.price - a.price);
    // popular: keep original order for now
    return list;
  }, [formattedProducts, id, selectedCategory, query, sort]);

  // Products to display (with pagination)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const hasMore = displayCount < filteredProducts.length;

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(10);
  }, [selectedCategory, query, sort]);

  // ✅ Check if user is locked to a different vendor
  useEffect(() => {
    const existingVendor = packs.find(
      (pack) => pack.items.length > 0 && pack.vendorName
    );

    if (existingVendor && existingVendor.vendorName !== vendor?.storeName) {
      if (!hasRedirected.current) {
        hasRedirected.current = true; // Mark as executed
        setIsRedirecting(true); // Show loader
        toast.error(
          `You have items from ${existingVendor.vendorName}. Complete that order first.`,
          { duration: 4000 }
        );
        setTimeout(() => {
          navigate(`/vendor/${existingVendor.vendorId}`, { replace: true }); // Redirect to the vendor they have items from
        }, 1500);
      }
    } else {
      // Reset if we're on the correct vendor page
      hasRedirected.current = false;
      setIsRedirecting(false);
    }
  }, [vendor, packs, navigate]);

  const handleAddPack = () => {
    // ✅ Check if user already has items from a different vendor
    const existingVendor = packs.find(
      (pack) => pack.items.length > 0 && pack.vendorName
    );

    if (existingVendor && existingVendor.vendorName !== vendor?.storeName) {
      toast.error(
        `You already have items from ${existingVendor.vendorName}. You can only order from one vendor at a time.`
      );
      return;
    }

    const newPack = addPack(); // calls your context to add a new pack
    setSelectedPack(newPack.id); // automatically switch to it
    toast.success(`New pack "${newPack.name}" created`);
  };
  const handleAddToPack = (product) => {
    setAdding((prev) => ({ ...prev, [product.id]: true }));
    const currentPack = packs.find((p) => p.id === selectedPack);

    if (!currentPack) {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
      toast.error("Please select or create a pack first");
      return;
    }

    // Store online check
    const isOnline = String(vendor?.Active).toLowerCase() === "true";
    if (!isOnline) {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
      toast.error("This store is offline. You can't add items right now.");
      return;
    }

    // ✅ Check if any pack already has items from a different vendor
    const packWithDifferentVendor = packs.find(
      (pack) =>
        pack.items.length > 0 &&
        pack.vendorName &&
        pack.vendorName !== product.vendorName
    );

    if (packWithDifferentVendor) {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
      toast.error(
        `You already have items from ${packWithDifferentVendor.vendorName}. You can only order from one vendor at a time.`
      );
      return;
    }

    // ✅ If pack has no vendor yet, assign it
    if (!currentPack.vendorName) {
      currentPack.vendorName = product.vendorName;
      currentPack.vendorId = product.vendorId;
    }

    // ✅ Prevent mixing vendors in the same pack
    if (currentPack.vendorName !== product.vendorName) {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
      toast.error(
        `You can only add items from ${currentPack.vendorName} to this pack.`
      );
      return;
    }

    // ✅ Prevent duplicates
    const alreadyInPack = currentPack.items.some(
      (item) => item.id === product.id
    );
    if (alreadyInPack) {
      setAdding((prev) => ({ ...prev, [product.id]: false }));
      toast.error(`${product.name} is already in this pack.`);
      return;
    }

    // ✅ Make sure the product added carries vendorName and vendorId
    const productWithVendor = {
      ...product,
      vendorName: product.vendorName,
      vendorId: product.vendorId,
      quantity: 1,
    };

    try {
      addToCart(productWithVendor, selectedPack);
      toast.success(`${product.name} added to ${currentPack.name}`);
    } finally {
      setTimeout(() => {
        setAdding((prev) => ({ ...prev, [product.id]: false }));
      }, 300);
    }
  };

  const currentPack = packs.find((p) => p.id === selectedPack);
  // const inCart = currentPack?.items.some(
  //   (item) => item.id === vendorProducts.id
  // );

  // ✅ Show redirecting loader if user is being redirected
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 animate-pulse">
            <svg
              className="w-8 h-8 text-white animate-spin"
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
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Redirecting...
          </h3>
          <p className="text-sm text-gray-600">
            Taking you back to your selected vendor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-28">
      {/* Floating Add Pack Button - only when no packs exist */}
      {packs.length === 0 && (
        <button
          onClick={handleFloatingAddPack}
          className="fixed bottom-6 right-6 z-50 animate-bounce bg-gradient-to-br from-[#9e0505] to-[#c91a1a] text-white rounded-full shadow-xl p-3 cursor-pointer flex items-center justify-center hover:scale-110 transition-all border-4 border-white drop-shadow-xl"
          aria-label="Add Pack"
        >
          <LuPackagePlus size={22} />
        </button>
      )}
      <SEO
        title={`${vendor?.storeName || "Vendor"} - Order Food Online | ${
          SITE_CONFIG.name
        }`}
        description={`Browse ${vendor?.storeName}'s menu and order delicious meals for campus delivery. Fast service, great food, and exclusive deals.`}
        keywords={[
          "vendor menu",
          vendor?.storeName,
          "food ordering",
          "campus restaurant",
          "meal delivery",
        ]}
        image={vendor?.image || SITE_CONFIG.image}
        type="restaurant"
        structuredData={
          vendor
            ? generateStructuredData("restaurant", {
                name: vendor.storeName,
                image: vendor.image,
                address: vendor.location,
                servesCuisine: "University Food",
                priceRange: "₦",
              })
            : null
        }
      />
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-rose-500/15 to-orange-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-400/15 blur-3xl" />

      {/* Vendor Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        {vendor?.image ? (
          <img
            src={vendor?.image}
            alt={vendor.storeName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
            <MdFastfood className="w-20 h-20 text-red-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 top-3 flex items-center justify-between px-4 text-white">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md bg-white/10 p-2 backdrop-blur hover:bg-white/20"
            aria-label="Go back"
          >
            <IoMdArrowBack />
          </button>
          <button
            onClick={() => setFav((v) => !v)}
            className={`rounded-md p-2 backdrop-blur transition ${
              fav ? "bg-rose-500/80" : "bg-white/10 hover:bg-white/20"
            }`}
            aria-label="Toggle favorite"
          >
            {fav ? (
              <FaHeart className="text-white" />
            ) : (
              <FaRegHeart className="text-white" />
            )}
          </button>
        </div>
        <div className="absolute bottom-5 left-0 right-0 px-4">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white/10 p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3 text-white">
              <div>
                <h1 className="text-2xl font-[800] tracking-tight">
                  {vendor?.storeName || "Vendor"}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-white/90">
                  <FaStar className="text-yellow-300" />
                  <span>{Number(vendor?.rating || 4.7).toFixed(1)}</span>
                  <span>•</span>
                  <span>{vendor?.time || "25–35 min"}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold text-white ${
                  String(vendor?.Active).toLowerCase() === "true"
                    ? "bg-emerald-500/90"
                    : "bg-gray-500/90"
                }`}
              >
                {String(vendor?.Active).toLowerCase() === "true"
                  ? "Online"
                  : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-0 z-10 -mt-3 bg-gradient-to-b from-white to-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full placeholder:text-xs rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
              <MdOutlineSort className="text-gray-500" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent placeholder:text-xs text-xs outline-none"
              >
                <option className="text-xs " value="popular">
                  Popular
                </option>
                <option className="text-xs " value="price-asc">
                  Price: Low → High
                </option>
                <option className="text-xs " value="price-desc">
                  Price: High → Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <nav className="no-scrollbar overflow-x-auto px-4 pb-3">
          <ul className="flex gap-3">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-[var(--default)] hover:text-[var(--default)]"
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Pack selector */}
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Show pack selector only if packs exist */}
          {packs.length > 0 ? (
            <div className="relative flex-1">
              <button
                onClick={() => setShowPackDropdown(!showPackDropdown)}
                className="w-full inline-flex items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                    <TfiPackage size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-medium">
                      Selected Pack
                    </p>
                    <p className="text-[13px] font-bold text-gray-900">
                      {packs.find((p) => p.id === selectedPack)?.name ||
                        "Select a pack"}
                      <span className="text-gray-500 font-normal ml-1">
                        (
                        {packs.find((p) => p.id === selectedPack)?.items
                          .length || 0}{" "}
                        {packs.find((p) => p.id === selectedPack)?.items
                          .length === 1
                          ? "item"
                          : "items"}
                        )
                      </span>
                    </p>
                  </div>
                </div>
                <FiChevronDown
                  className={`text-gray-400 transition-transform ${
                    showPackDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showPackDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-64 overflow-y-auto">
                  {packs.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => {
                        setSelectedPack(pack.id);
                        setShowPackDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedPack === pack.id ? "bg-rose-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`grid h-8 w-8 place-items-center rounded-lg ${
                            selectedPack === pack.id
                              ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <TfiPackage size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[13px] font-semibold truncate ${
                              selectedPack === pack.id
                                ? "text-rose-700"
                                : "text-gray-900"
                            }`}
                          >
                            {pack.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {pack.items.length}{" "}
                            {pack.items.length === 1 ? "item" : "items"}
                            {pack.vendorName && ` · ${pack.vendorName}`}
                          </p>
                        </div>
                      </div>
                      {selectedPack === pack.id && (
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white flex-shrink-0">
                          <IoCheckmark size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  No packs created yet
                </p>
                <p className="text-xs text-gray-600">
                  Click "New" to create pack
                </p>
              </div>
            </div>
          )}

          {/* Add Pack Button - Always visible */}
          <button
            onClick={handleAddPack}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#9e0505] to-[#c91a1a] px-4 py-3 text-[13px] font-semibold text-white shadow-sm transition hover:shadow-lg active:scale-[0.98]"
          >
            <BiPlus size={18} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Offline banner */}
      {String(vendor?.Active).toLowerCase() !== "true" && (
        <div className="mx-auto max-w-5xl px-4 mt-4">
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-[13px] font-[400]">
            This store is currently offline. Browsing is allowed, but ordering
            is disabled.
          </div>
        </div>
      )}
      {/* Product Grid */}
      <main className="mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loadingProducts ? (
          <div className="col-span-full h-[50vh] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <svg
                className="w-10 h-10 text-gray-400 animate-spin"
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
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Loading Products...
            </h3>
            <p className="text-center text-gray-500">
              Please wait while we fetch the products.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full h-[50vh] flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No Products
            </h3>
            <p className="text-center text-gray-500">
              No products available in this category.
            </p>
          </div>
        ) : (
          displayedProducts.map((product) => {
            const currentPack = packs.find((p) => p.id === selectedPack);
            const inCart = currentPack?.items.some(
              (item) => item.id === product.id
            );

            return (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative w-full overflow-hidden aspect-[4/3]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-orange-100 via-red-50 to-rose-100 flex items-center justify-center">
                      <div className="text-center">
                        <MdFastfood className="w-16 h-16 text-orange-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-gray-400">
                          {product.name}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Price chip */}
                  <span className="absolute top-3 left-3 rounded-xl px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700/90 shadow-md">
                    ₦{product.price.toLocaleString()}
                  </span>
                  <span
                    className={`absolute top-3 right-3 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-md ${
                      product.available === true
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                    }`}
                  >
                    {product.available === true ? "In Stock" : "Out of Stock"}
                  </span>

                  {/* Quick actions overlay */}
                  <div className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-between gap-2 rounded-xl bg-white/90 p-2 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-center text-[12px] font-semibold text-gray-700 hover:bg-gray-50">
                      View
                    </Link>
                    <button
                      disabled={
                        !product.available ||
                        String(vendor?.Active).toLowerCase() !== "true"
                      }
                      onClick={() => handleAddToPack(product)}
                      className={`flex-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition flex items-center justify-center gap-2 ${
                        product.available &&
                        String(vendor?.Active).toLowerCase() === "true"
                          ? "bg-gray-900 text-white hover:opacity-90"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {String(vendor?.Active).toLowerCase() !== "true" ? (
                        "Offline"
                      ) : adding[product.id] ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          <span>Adding</span>
                        </>
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                  {!product.available && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
                  )}
                </div>

                <div className="p-3">
                  <p className="mb-1 text-[11px] font-[300] text-gray-500">
                    {product.category}
                  </p>
                  <h3 className="mb-2 line-clamp-2 text-[13px] font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--default)]">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {inCart && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-700">
                        <FiPackage /> In Pack
                      </span>
                    )}
                  </div>

                  <button
                    disabled={
                      !product.available ||
                      String(vendor?.Active).toLowerCase() !== "true"
                    }
                    onClick={() => handleAddToPack(product)}
                    className={`w-full rounded-[10px] py-2 text-[12px] font-semibold transition-all flex items-center justify-center gap-2 ${
                      inCart
                        ? "bg-gray-100 text-gray-600 border border-gray-200"
                        : product.available &&
                          String(vendor?.Active).toLowerCase() === "true"
                        ? "bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white hover:shadow-lg active:scale-[0.99]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {inCart ? (
                      <span className="flex items-center gap-1">
                        {" "}
                        <div>
                          {" "}
                          <FiPackage />
                        </div>
                        In Pack
                      </span>
                    ) : product.available &&
                      String(vendor?.Active).toLowerCase() === "true" ? (
                      adding[product.id] ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          <span>Adding...</span>
                        </>
                      ) : (
                        "Add to Pack"
                      )
                    ) : String(vendor?.Active).toLowerCase() !== "true" ? (
                      "Store Offline"
                    ) : (
                      "Out of Stock"
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Infinite Scroll Loader */}
      {hasMore && filteredProducts.length > 0 && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-rose-500"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <p className="text-sm text-gray-500">Loading more products...</p>
          </div>
        </div>
      )}

      {/* End of results message */}
      {!hasMore && filteredProducts.length > 10 && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-gray-400">
            You've reached the end • {filteredProducts.length} products shown
          </p>
        </div>
      )}

      {/* Sticky pack summary bar */}
      {currentPack && (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto mb-3 max-w-5xl px-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-xl backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                <GoPackage />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] text-gray-500">
                  Current Pack
                </p>
                <p className="truncate text-sm font-[800] text-gray-900">
                  {currentPack.name} · {currentPack.items.length}{" "}
                  {currentPack.items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/cart")}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Review Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendor;
