import axios from "axios";
import { useEffect, useState, createContext, useContext } from "react";
import toast from "react-hot-toast"; // ✅ make sure you import toast
import { useSocket } from "./SocketContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { socket } = useSocket?.() || {};
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState(null);
  const [userLoader, setUserLoader] = useState(false);
  const [orderLoader, setOrderLoader] = useState(false);
  const [products, setVendorProducts] = useState(false);
  const [orders, setAllOrders] = useState([]);
  const userId = localStorage.getItem("userId");

  const userFetch = async () => {
    if (!userId) return; // ✅ only fetch when userId exists
    try {
      setUserLoader(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/user/${userId}`
      );

      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        toast.error("Unable to get user. Try again.");
      }
    } catch (error) {
      console.error("User fetch error:", error);
      toast.error("Failed to fetch user data.");
    } finally {
      setUserLoader(false);
    }
  };
  const vendorFetch = async () => {
    if (!userId) return; // ✅ only fetch when userId exists
    try {
      setUserLoader(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`
      );

      if (response) {
        setVendors(response?.data);
      } else {
        toast.error("Unable to get Vendors. Try again.");
      }
    } catch (error) {
      console.error("User fetch error:", error);
      toast.error("Failed to fetch Vendors data.");
    } finally {
      setUserLoader(false);
    }
  };
  const ProductFetch = async () => {
    if (!userId) return; // ✅ only fetch when userId exists
    try {
      setUserLoader(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/vendors/allProduct`
      );

      if (response?.data) {
        setVendorProducts(response.data);
      } else {
        toast.error("Unable to get Products. Try again.");
      }
    } catch (error) {
      console.error("User fetch error:", error);
      toast.error("Failed to fetch Products data.");
    } finally {
      setUserLoader(false);
    }
  };

  const useGetOrders = async () => {
    setOrderLoader(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
      );
      if (response) {
        setAllOrders(response.data.orders);
      } else {
        toast.error("error fetching Orders Please try again");
      }
    } catch (error) {
      toast.error("error fetching Orders Please try again");
    } finally {
      setOrderLoader(false);
    }
  };
  useEffect(() => {
    userFetch();
  }, [userId]); // ✅ re-run when userId changes

  useEffect(() => {
    useGetOrders();
    ProductFetch();
    vendorFetch();
  }, []);

  // Live updates via socket
  useEffect(() => {
    if (!socket) return;
    const refreshUser = () => userFetch();
    const refreshOrders = () => useGetOrders();
    const refreshProducts = () => ProductFetch();
    const refreshVendors = () => vendorFetch();
    socket.on("users:balanceUpdated", refreshUser);
    socket.on("orders:new", refreshOrders);
    socket.on("orders:status", refreshOrders);
    socket.on("products:new", refreshProducts);
    socket.on("products:updated", refreshProducts);
    socket.on("products:deleted", refreshProducts);
    socket.on("products:toggled", refreshProducts);
    socket.on("vendors:updated", refreshVendors);
    return () => {
      socket.off("users:balanceUpdated", refreshUser);
      socket.off("orders:new", refreshOrders);
      socket.off("orders:status", refreshOrders);
      socket.off("products:new", refreshProducts);
      socket.off("products:updated", refreshProducts);
      socket.off("products:deleted", refreshProducts);
      socket.off("products:toggled", refreshProducts);
      socket.off("vendors:updated", refreshVendors);
    };
  }, [socket, userId]);
  // Optional: handle multi-tab login/logout sync
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserId = localStorage.getItem("userId");
      if (updatedUserId !== userId) {
        userFetch();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userId]);
  console.log(products);

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        products,
        vendors,
        userLoader,
        orderLoader,
        userFetch,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
