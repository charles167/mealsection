function CategoryFilter({ categories, selected, onSelect }) {
    return (
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm ${
              selected === cat ? "bg-green-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => onSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }
  
  export default CategoryFilter;
  