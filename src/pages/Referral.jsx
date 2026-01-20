import React from 'react';

const ReferralScreen = () => {
  const handleCopyLink = () => {
    // In a real app, you would copy the actual referral link to clipboard
    navigator.clipboard.writeText("https://your-app.com/referral?code=YOURREFCODE")
      .then(() => {
        alert("Referral link copied!");
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="flex items-center p-4 bg-white shadow-sm relative z-10">
        <span className="text-2xl cursor-pointer mr-4">←</span>
        <h1 className="flex-grow text-center text-lg font-semibold">Referral</h1>
        {/* Mock status bar icons, adjust as needed */}
        <div className="absolute top-4 right-4 text-xs flex items-center space-x-1">
          <span>9:41</span>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </header>

      {/* Background with subtle food icons - SVG in CSS is generally better for this */}
      {/* For simplicity and direct styling with Tailwind, we'll use a placeholder background.
          To achieve the exact background effect, you'd define a custom background-image in your global CSS
          or extend Tailwind's theme. For this example, we'll keep it simple or use a light background color. */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center bg-gray-50 relative overflow-hidden">
        {/* A simple way to simulate the background pattern with Tailwind (less efficient than SVG) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Example of a repeated icon background - for complex patterns, use CSS `background-image` */}
          <div className="absolute top-1/4 left-1/4 text-gray-200 text-6xl">🍔</div>
          <div className="absolute top-1/2 right-1/4 text-gray-200 text-6xl">🍟</div>
          <div className="absolute bottom-1/4 left-1/2 text-gray-200 text-6xl">🍕</div>
          <div className="absolute top-1/3 right-1/3 text-gray-200 text-6xl">🥤</div>
          <div className="absolute bottom-1/3 left-1/3 text-gray-200 text-6xl">🍴</div>
        </div>

        <p className="text-xl font-medium text-gray-800 mb-8 max-w-sm z-10">
          Invite a friend and get a discount off your next order!!!
        </p>
        <button
          onClick={handleCopyLink}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out z-10"
        >
          <span>Copy referral link</span>
          <span className="ml-3 text-lg">📋</span> {/* Clipboard icon */}
        </button>
      </div>
    </div>
  );
};

export default ReferralScreen;