import MealCard from "../components/MealCard";
import CategoryFilter from "../components/CategoryFilter";
import { useState } from "react";

const dummyMeals = [
  { id: 1, name: "Jollof Rice", price: 8, image: "https://via.placeholder.com/150", category: "Rice" },
  { id: 2, name: "Pasta Delight", price: 10, image: "https://via.placeholder.com/150", category: "Pasta" },
  { id: 3, name: "Burger", price: 12, image: "https://via.placeholder.com/150", category: "Fast Food" },
];

const categories = ["All", "Rice", "Pasta", "Fast Food"];

function MealList() {
  const [selected, setSelected] = useState("All");

  const filteredMeals =
    selected === "All" ? dummyMeals : dummyMeals.filter((meal) => meal.category === selected);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Available Meals</h2>
      <CategoryFilter categories={categories} selected={selected} onSelect={setSelected} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
}

export default MealList;
