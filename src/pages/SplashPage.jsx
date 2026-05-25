import React from 'react';

const SplashPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans items-center justify-center p-4 overflow-hidden">
      <div className="flex flex-col items-center">
        {/* MealSection logo and text */}
        <div className="flex items-center space-x-2 absolute top-4 left-4">
          <img src="https://example.com/meal-section-logo.png" alt="MealSection Logo" className="h-8" />
          <span className="text-xl font-bold text-gray-800">Mealsection</span>
        </div>

        {/* Sliding Bike Illustration */}
        <div className="relative w-full max-w-sm h-48 overflow-hidden mb-8">
          <img 
            src="https://example.com/bike-illustration.png" 
            alt="Delivery Bike" 
            className="absolute top-0 w-full animate-slide-right" 
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
            Welcome to MealSection
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-600 italic">
            ...food delivery to your doorstep
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashPage;