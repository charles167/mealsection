import { useCartContext } from "../context/CartContext";

function Checkout() {
  const { getCartTotal } = useCartContext();

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded-md mt-8">
      {/* ...form fields... */}
      
      {/* Order Summary */}
      <div className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-md">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold text-green-600">₦{getCartTotal()}</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        Confirm Order
      </button>
    </div>
  );
}

export default Checkout;
