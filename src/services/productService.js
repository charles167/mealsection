import axios from "axios";

// Add ngrok-skip-browser-warning header globally
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

const API = import.meta.env.VITE_REACT_APP_API;

export const fetchProductsByVendor = async (vendorId) => {
  if (!vendorId) throw new Error("vendorId is required");
  const { data } = await axios.get(
    `${API}/api/vendors/allProduct?vendorId=${vendorId}`
  );
  return data;
};
