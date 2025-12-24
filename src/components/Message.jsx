import React from "react";

function Message({ message, type }) {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md text-white 
        ${type === "error" ? "bg-red-600" : "bg-green-600"}`}
    >
      {message}
    </div>
  );
}

export default Message;
