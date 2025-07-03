import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: "About", path: "/about" },
  ];

  const user = JSON.parse(localStorage.getItem("user")); // or from context

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black dark:text-white">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Blog
          </span>
          <span className="text-pink-600">App</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-purple-600 dark:text-pink-400"
                    : "text-gray-700 dark:text-gray-300"
                } hover:text-purple-700 dark:hover:text-white`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* + Create button (only if logged in) */}
          {user && (
            <Link
              to="/add-blog"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow text-sm"
            >
              + Create
            </Link>
          )}

          {!user && (
            <>
              <Link
                to="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}

          <DarkModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          <DarkModeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800 dark:text-gray-100 focus:outline-none"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden overflow-hidden transition-all duration-300 ease-in-out">
          <div className="px-6 pb-6 pt-2 space-y-4 bg-white dark:bg-gray-900">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-lg font-medium ${
                    isActive
                      ? "text-purple-600 dark:text-pink-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* + Create for mobile */}
            {user && (
              <Link
                to="/add-blog"
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-2 rounded-md font-semibold"
              >
                + Create
              </Link>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full bg-purple-600 text-white text-center py-2 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full bg-pink-500 text-white text-center py-2 rounded-md font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
