import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  return (
    <Link
      to={`/blogs/${blog.blogId}`}
      className="block max-w-4xl mx-auto px-4 sm:px-6 lg:px-0"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-300 dark:border-gray-700 pb-8 mb-8 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-lg p-2">
        
        {/* Thumbnail */}
        <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Blog Info */}
        <div className="flex-1">
          {/* Author */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            By{" "}
            <span className="text-gray-800 dark:text-white font-medium">
              {blog.creator?.name || "Anonymous"}
            </span>
          </p>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {blog.title}
          </h2>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-3 line-clamp-3">
            {blog.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>❤️ {blog.likes?.length || 0}</span>
            <span>💬 {blog.comments?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
