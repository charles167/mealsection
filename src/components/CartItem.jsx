function CartItem({ item }) {
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-200 p-2 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm">{item.name}</h4>
            <p className="text-xs text-gray-500">₦{item.price}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-red-600 text-lg">-</button>
          <span className="text-sm font-bold">{item.quantity}</span>
          <button className="text-red-600 text-lg">+</button>
        </div>
        <span className="font-semibold text-sm">
          ₦{item.price * item.quantity}
        </span>
      </div>
    );
  }
  
  export default CartItem;
  