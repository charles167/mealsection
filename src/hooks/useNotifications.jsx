import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

/**
 * Custom hook for real-time in-app notifications using Socket.io
 * This serves as a reliable fallback for FCM push notifications
 */
export function useNotifications(userId) {
  const { socket } = useSocket?.() || {};
  const audioRef = useRef(null);

  useEffect(() => {
    if (!socket || !userId) return;

    // Create notification sound
    if (!audioRef.current) {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLTgjMGHm7A7+OZURE"
      );
    }

    const playNotificationSound = () => {
      try {
        audioRef.current?.play();
      } catch (err) {
        console.log("Could not play notification sound:", err);
      }
    };

    // Listen for order-related notifications
    const handleOrderNew = (order) => {
      if (order.userId === userId) {
        playNotificationSound();
        toast.success("🎉 Order placed successfully!", {
          duration: 5000,
          style: {
            background: "#10b981",
            color: "#fff",
          },
        });
      }
    };

    const handleOrderStatus = (updatedOrder) => {
      if (updatedOrder.userId === userId) {
        playNotificationSound();

        const status = updatedOrder.currentStatus?.toLowerCase();
        let message = "📦 Order updated";
        let icon = "📦";

        if (status === "processing") {
          message = "Your order is being processed!";
          icon = "👨‍🍳";
        } else if (status === "delivered") {
          message = "Your order has been delivered!";
          icon = "✅";
        } else if (
          updatedOrder.rider &&
          updatedOrder.rider !== "Not assigned"
        ) {
          message = "A rider has been assigned to your order!";
          icon = "🛵";
        }

        toast.success(`${icon} ${message}`, {
          duration: 6000,
          style: {
            background: "#10b981",
            color: "#fff",
          },
        });
      }
    };

    const handlePacksUpdated = (updatedOrder) => {
      if (updatedOrder.userId === userId) {
        playNotificationSound();

        // Check if any pack was accepted or rejected
        const acceptedPacks =
          updatedOrder.packs?.filter((p) => p.accepted === true) || [];
        const rejectedPacks =
          updatedOrder.packs?.filter((p) => p.accepted === false) || [];

        if (acceptedPacks.length > 0) {
          const vendorNames = acceptedPacks.map((p) => p.vendorName).join(", ");
          toast.success(`✅ ${vendorNames} accepted your order!`, {
            duration: 6000,
            style: {
              background: "#10b981",
              color: "#fff",
            },
          });
        }

        if (rejectedPacks.length > 0) {
          const vendorNames = rejectedPacks.map((p) => p.vendorName).join(", ");
          toast.error(`❌ ${vendorNames} declined your order`, {
            duration: 6000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          });
        }
      }
    };

    const handleBalanceUpdated = (data) => {
      if (data.userId === userId) {
        playNotificationSound();
        const balance = data.newBalance ?? data.availableBal ?? 0;
        toast.success(
          `💰 Balance updated: ₦${Number(balance).toLocaleString()}`,
          {
            duration: 4000,
            style: {
              background: "#10b981",
              color: "#fff",
            },
          }
        );
      }
    };

    // Register socket listeners
    socket.on("orders:new", handleOrderNew);
    socket.on("orders:status", handleOrderStatus);
    socket.on("vendors:packsUpdated", handlePacksUpdated);
    socket.on("users:balanceUpdated", handleBalanceUpdated);

    // Cleanup
    return () => {
      socket.off("orders:new", handleOrderNew);
      socket.off("orders:status", handleOrderStatus);
      socket.off("vendors:packsUpdated", handlePacksUpdated);
      socket.off("users:balanceUpdated", handleBalanceUpdated);
    };
  }, [socket, userId]);
}
