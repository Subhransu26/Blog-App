import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DarkModeToggle from "../components/DarkModeToggle";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../utils/userSilce";

function AuthForm({ type }) {
  const isLogin = type === "login";

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const validateFields = () => {
    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    if (!isLogin) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.username.trim())
        newErrors.username = "Username is required";
    }

    // Remove empty error fields
    Object.keys(newErrors).forEach(
      (key) => !newErrors[key] && delete newErrors[key]
    );

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const baseUrl = import.meta.env.VITE_BACKEND_URL;
    if (!baseUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = type.toLowerCase();
      const res = await axios.post(`${baseUrl}/${endpoint}`, formData, {
        withCredentials: true,
      });
      const { user, token, message } = res.data;

      if (!isLogin) {
        toast.success(message);
        navigate("/login");
      } else {
        dispatch(login({ user, token }));
        toast.success(message);
        navigate("/home");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7F00FF] via-[#E100FF] to-[#FF7F50] blur-3xl opacity-20 z-0 animate-gradient" />

      <div className="relative z-10 flex h-full">
        {/* Left Section */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-[#7F00FF] via-[#E100FF] to-[#FF7F50] text-white p-10 animate-gradient bg-animate">
          <div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Welcome to Blog App
            </h1>
            <p className="text-lg max-w-md">
              Share your thoughts, read amazing content, and connect with other
              bloggers.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90">
          <div className="w-full max-w-xl p-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white mb-8">
              {isLogin ? "User Login" : "Create an Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Full Name
                    </label>
                    <input
                      autoFocus
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="mt-1 w-full px-4 py-3 border rounded-md bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="mt-1 w-full px-4 py-3 border rounded-md bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  autoFocus={isLogin}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1 w-full px-4 py-3 border rounded-md bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-11 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 text-xl"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <i className="fi fi-br-eye"></i>
                    ) : (
                      <i className="fi fi-br-eye-crossed"></i>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-md shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? isLogin
                    ? "Logging in..."
                    : "Signing up..."
                  : isLogin
                  ? "Login"
                  : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link
                to={isLogin ? "/signup" : "/login"}
                className="text-purple-600 hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
