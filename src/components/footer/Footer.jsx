import React from "react";
import { MdOutlinePhone, MdEmail, MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";

const Footer = () => {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://web.facebook.com/profile.php?id=61555818232401",
      icon: "https://img.icons8.com/3d-fluency/94/facebook-circled.png",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/meal.section/",
      icon: "https://img.icons8.com/3d-fluency/94/instagram-logo.png",
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/+2347013234960",
      icon: "https://img.icons8.com/3d-fluency/94/whatsapp.png",
    },
    {
      name: "Phone",
      url: "tel:+2347013234960",
      icon: "https://img.icons8.com/3d-fluency/94/phone.png",
    },
    {
      name: "Email",
      url: "mailto:mealsection@gmail.com",
      icon: "https://img.icons8.com/3d-fluency/94/gmail.png",
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src="https://github.com/Favour-111/my-asset/blob/main/images%20(2).jpeg?raw=true"
              alt="MealSection Logo"
              className="w-40 hover:scale-105 transition-transform duration-300"
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              MealSection ensures a delightful culinary experience with a
              diverse menu and a user-friendly platform for easy ordering.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
              Navigation
            </h3>
            <ul className="space-y-3">
              {["Home", "About", "Contact", "FAQ", "Vendors"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-[var(--default)] text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
              Company
            </h3>
            <ul className="space-y-3">
              {[
                "Terms & Conditions",
                "Privacy Policy",
                "Checkout",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-gray-600 hover:text-[var(--default)] text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">
              Contact
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+2347013234960"
                  className="flex items-center gap-2 text-gray-600 hover:text-[var(--default)] text-sm transition-colors group"
                >
                  <MdOutlinePhone
                    size={18}
                    className="text-[var(--default)] group-hover:scale-110 transition-transform"
                  />
                  <span>+234 701 323 4960</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:mealsection@gmail.com"
                  className="flex items-center gap-2 text-gray-600 hover:text-[var(--default)] text-sm transition-colors group"
                >
                  <MdEmail
                    size={18}
                    className="text-[var(--default)] group-hover:scale-110 transition-transform"
                  />
                  <span>mealsection@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex gap-2 text-gray-600 text-sm">
                  <MdLocationOn
                    size={18}
                    className="text-[var(--default)] flex-shrink-0 mt-0.5"
                  />
                  <span>
                    Faith City, Ketu Adie-Owe, Lusada – Igbesa, Ogun State,
                    Nigeria.
                  </span>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={() => window.location.replace(social.url)}
                  className="hover:scale-110 transition-transform duration-300 hover:-translate-y-1"
                  aria-label={social.name}
                >
                  <img
                    width="32"
                    height="32"
                    src={social.icon}
                    alt={social.name}
                    className="drop-shadow-sm"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[var(--default)]">
              MealSection
            </span>
            . All Rights Reserved. Powered by{" "}
            <span className="font-semibold">Horbah's Tech</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
