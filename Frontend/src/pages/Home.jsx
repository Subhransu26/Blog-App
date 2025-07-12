import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const name = useSelector((state) => state.user.name);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-all duration-300 px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-500 text-transparent bg-clip-text">
          Welcome back, {name}!
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300">
          You’ve landed on your personal blogging dashboard. Whether you want to
          inspire, inform, or entertain—this is your creative space to shine.
        </p>

        <p className="text-base text-gray-600 dark:text-gray-400">
          Start by writing a new blog, editing your past masterpieces, or
          exploring what others have created.
        </p>

        <div className="flex justify-center gap-4 pt-4 flex-wrap">
          <button
            onClick={() => navigate("/add-blog")}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300"
          >
            Create New Blog
          </button>

          <button
            onClick={() => navigate("/my-blogs")}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            View My Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
