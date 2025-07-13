import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Spinner } from "../components/Common/Spinner";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyBlogsPage = () => {
  const user = useSelector((state) => state.user);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBlogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/user`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log("✅ My Blogs Response:", res.data);
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("❌ Axios error:", err.response?.data || err.message);
      toast.error("Failed to fetch your blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  if (loading) return <Spinner message="Loading your blogs..." />;

  return (
    <div className="min-h-screen bg-gray-100  dark:bg-gray-900 px-6 py-10 text-black dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Blogs</h1>

        {blogs.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            You haven't written any blogs yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={blog.image || "https://via.placeholder.com/400x200"}
                  alt={blog.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-2">
                  <h2 className="text-xl font-semibold line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {blog.description}
                  </p>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-indigo-500">
                      ❤️ {blog.likes?.length || 0}
                    </span>
                    <span>💬 {blog.comments?.length || 0}</span>
                    {blog.draft && (
                      <span className="text-yellow-500 font-medium">Draft</span>
                    )}
                  </div>
                  <Link
                    to={`/blogs/${blog.blogId}`}
                    className="inline-block mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                  >
                    View Blog →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogsPage;
