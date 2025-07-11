import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, BookText, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../utils/userSilce";
import DarkModeToggle from "./DarkModeToggle";
import { useSelector } from "react-redux";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-[64px]">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl font-bold text-black dark:text-white"
            >
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Blog
              </span>
              <span className="text-pink-600">App</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex w-[300px] bg-white dark:bg-slate-800 px-4 py-2 rounded-full items-center shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-slate-700">
              <i className="fi fi-rr-search text-pink-500 text-base" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent ml-2 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Nav items  */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/blogs"
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive
                      ? "text-purple-600 dark:text-pink-400"
                      : "text-gray-700 dark:text-gray-300"
                  } hover:text-purple-700 dark:hover:text-white`
                }
              >
                Blogs
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive
                      ? "text-purple-600 dark:text-pink-400"
                      : "text-gray-700 dark:text-gray-300"
                  } hover:text-purple-700 dark:hover:text-white`
                }
              >
                About
              </NavLink>

              {user && (
                <NavLink
                  to="/add-blog"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-sm font-medium ${
                      isActive
                        ? "text-purple-600 dark:text-pink-400"
                        : "text-gray-700 dark:text-gray-300"
                    } hover:text-purple-700 dark:hover:text-white`
                  }
                >
                  <i className="fi fi-rr-edit text-base"></i>
                  Write
                </NavLink>
              )}

              {!user ? (
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
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <img
                    src={
                      user?.avatar ||
                      "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg"
                    }
                    alt="Profile"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-full cursor-pointer border border-gray-300 dark:border-gray-600 object-cover"
                  />
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/my-blogs"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <BookText size={16} />
                        My Blogs
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-800 dark:text-gray-100"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 pt-4 space-y-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md">
          <NavLink
            to="/blogs"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <i className="fi fi-rr-document"></i>
            Blogs
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <i className="fi fi-rr-info"></i>
            About
          </NavLink>

          {user ? (
            <>
              <Link
                to="/add-blog"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <i className="fi fi-rr-edit text-base"></i>
                Write
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <i className="fi fi-rr-user"></i>
                Profile
              </Link>
              <Link
                to="/my-blogs"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <i className="fi fi-rr-folder"></i>
                My Blogs
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600"
              >
                <i className="fi fi-rr-sign-out-alt"></i>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <i className="fi fi-rr-sign-in-alt"></i>
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <i className="fi fi-rr-user-add"></i>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
