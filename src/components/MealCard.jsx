import { useCartContext } from "../context/CartContext";

function MealCard({ meal }) {
  const { addToCart } = useCartContext();

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold">{meal.name}</h3>
      <p className="text-gray-600">${meal.price}</p>
      <button
        onClick={() => addToCart(meal)}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}

export default MealCard;
