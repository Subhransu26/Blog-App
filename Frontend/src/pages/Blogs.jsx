import { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  async function fetchBlogs() {
    const res = await axios.get("http://localhost:3000/api/v1/blogs");
    setBlogs(res.data.blogs);
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen px-4 mt-5 py-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {blogs.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
    </div>
  );
};

export default Blogs;
