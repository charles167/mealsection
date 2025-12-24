import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
          <Link to="/" className="text-2xl font-bold text-red-600">
            Mealsection
          </Link>
          <p className="text-sm text-gray-400 mt-2">
            © {new Date().getFullYear()} Mealsection. All rights reserved.
          </p>
        </div>

        {/* Navigation & Social Links */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <nav className="flex space-x-4">
            <Link to="/contact" className="text-gray-400 hover:text-white transition">
              Contact Us
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition">
              Terms
            </Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white transition">
              Privacy
            </Link>
          </nav>
          <div className="flex space-x-4">
            {/* Social Media Icons - Replace with your own SVGs or icons */}
            <a href="#" className="text-gray-400 hover:text-white transition">
              {/* Facebook Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3 8h-2v2h2v-2zm-3 0H8v2h2v-2zm-1 4h-2v2h2v-2zm-3 0h-2v2h2v-2zm10-4h-2v2h2v-2z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              {/* Twitter Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3 8h-2v2h2v-2zm-3 0H8v2h2v-2zm-1 4h-2v2h2v-2zm-3 0h-2v2h2v-2zm10-4h-2v2h2v-2z" /></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              {/* Instagram Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3 8h-2v2h2v-2zm-3 0H8v2h2v-2zm-1 4h-2v2h2v-2zm-3 0h-2v2h2v-2zm10-4h-2v2h2v-2z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;