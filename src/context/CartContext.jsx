import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- Load from localStorage or use default ---
  const [packs, setPacks] = useState(() => {
    const stored = localStorage.getItem("packs");
    return stored
      ? JSON.parse(stored)
      : [
          {
            id: Date.now(),
            name: "Pack 1",
            items: [],
            packType: null, // 'small' or 'big'
            packPrice: 0,
          },
        ];
  });

  // --- Save to localStorage whenever packs change ---
  useEffect(() => {
    localStorage.setItem("packs", JSON.stringify(packs));
  }, [packs]);

  // --- Add new pack ---
  const addPack = () => {
    const newPack = {
      id: Date.now(),
      name: `Pack ${packs.length + 1}`,
      items: [],
      packType: null,
      packPrice: 0,
    };
    setPacks((prev) => [...prev, newPack]);
    return newPack;
  };
  // --- Update pack type and price ---
  const updatePackType = (packId, packType, packPrice) => {
    setPacks((prev) =>
      prev.map((pack) =>
        pack.id === packId ? { ...pack, packType, packPrice } : pack
      )
    );
  };
  // --- Delete pack ---
  const deletePack = (packId) => {
    setPacks((prev) => prev.filter((pack) => pack.id !== packId));
  };
  // --- Add item to pack ---
  const addToCart = (product, packId) => {
    setPacks((prevPacks) =>
      prevPacks.map((pack) =>
        pack.id === packId
          ? {
              ...pack,
              vendorName: pack.vendorName || product.vendorName,
              vendorId: pack.vendorId || product.vendorId || null,
              items: [...pack.items, { ...product, quantity: 1 }],
            }
          : pack
      )
    );
  };

  // --- Remove item ---
  const removeFromCart = (itemId, packId) => {
    setPacks((prev) =>
      prev.map((pack) =>
        pack.id === packId
          ? { ...pack, items: pack.items.filter((i) => i.id !== itemId) }
          : pack
      )
    );
  };

  // --- Update item quantity ---
  const updateQuantity = (itemId, packId, change) => {
    setPacks((prev) =>
      prev.map((pack) =>
        pack.id === packId
          ? {
              ...pack,
              items: pack.items
                .map((item) =>
                  item.id === itemId
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
                )
                .filter((i) => i.quantity > 0),
            }
          : pack
      )
    );
  };
  // context/CartContext.js — add this function to provider
  const updatePackVendor = (packId, vendorName, vendorId = null) => {
    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, vendorName, vendorId } : p))
    );
  };

  // --- Calculate total amount across all packs ---
  const totalAmount = packs.reduce(
    (sum, pack) =>
      sum +
      pack.items.reduce((s, item) => s + item.price * (item.quantity || 1), 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        packs,
        setPacks,
        addPack,
        addToCart,
        updatePackVendor,
        removeFromCart,
        updateQuantity,
        deletePack,
        totalAmount,
        updatePackType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
