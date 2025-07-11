import { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import {Spinner} from "../components/Common/Spinner";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`, {
        params: {
          page,
          limit: 10,
        },
      });

      setBlogs((prev) => [...prev, ...res.data.blogs]);
      setHasMore(res.data.hasMore);
    } catch (error) {
      console.error("Failed to fetch blogs:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  return (
    <div className="min-h-screen px-4 mt-5 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {blogs.map((blog) => (
        <BlogCard key={blog._id} blog={blog} />
      ))}

      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
          >
            Load More
          </button>
        </div>
      )}

      {loading && <Spinner message="Loading blog..." />}
    </div>
  );
};

export default Blogs;
