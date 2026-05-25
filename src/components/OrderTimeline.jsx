import React from "react";
import {
  FaClock,
  FaSyncAlt,
  FaUser,
  FaMotorcycle,
  FaCheckCircle,
} from "react-icons/fa";

const statusIcons = {
  Pending: FaClock,
  Processing: FaSyncAlt,
  "Rider Assigned": FaUser,
  "On the way": FaMotorcycle,
  Delivered: FaCheckCircle,
};

const OrderTimeline = ({ data }) => {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300"></div>

      {data.map((item, index) => {
        const Icon = statusIcons[item.status] || FaClock;
        const isLast = index === data.length - 1;

        return (
          <div key={index} className="flex items-start mb-8">
            <div
              className={`relative z-10 w-11 h-11 flex items-center justify-center rounded-full ${
                item.completed
                  ? "bg-green-100 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              <Icon
                size={15}
                className={`${
                  item.completed ? "text-green-600" : "text-gray-400"
                }`}
              />
            </div>
            <div className="ml-4 flex-1">
              <p
                className={`font-semibold ${
                  item.completed ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {item.status}
              </p>
              {item.time && (
                <p className="text-sm text-gray-500">{item.time}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
