import React from 'react';

const ProductCard = ({ name, price, inStock, image }) => {
  return (
    <div className={`relative bg-white rounded-xl shadow-md overflow-hidden text-center flex flex-col items-center pt-4 ${!inStock ? 'opacity-60' : ''}`}>
      <div className="relative w-32 h-32 flex justify-center items-center mb-2">
        <div className="stock-badge absolute top-1 left-1 text-white text-xs font-bold px-2 py-1 rounded-full uppercase" style={{ backgroundColor: inStock ? '#d9534f' : '#888' }}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </div>
        <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden flex justify-center items-center">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="p-2 w-full">
        <div className="text-xs text-gray-500">Carbohydrates</div>
        <div className="text-base font-bold text-gray-800">{name}</div>
        <div className="text-lg font-bold text-gray-800">${price}</div>
      </div>
      <button 
        className={`w-full py-4 text-white font-bold ${inStock ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 cursor-not-allowed'}`}
        disabled={!inStock}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;