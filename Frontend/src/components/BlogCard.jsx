const BlogCard = ({ blog }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-300 dark:border-gray-700 pb-8 mb-8">
        {/* Thumbnail */}
        <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Blog Info */}
        <div className="flex-1">
          {/* Author */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            By{" "}
            <span className="text-gray-800 dark:text-white font-medium">
              {blog.creator.name}
            </span>
          </p>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:underline cursor-pointer">
            {blog.title}
          </h2>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-3 line-clamp-3">
            {blog.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>❤️ 4.4K</span>
            <span>💬 204</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
