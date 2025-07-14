import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { Spinner } from "../components/Common/Spinner";
import ShareDropdown from "../components/Dropdown/ShareDropdown";
import {
  addSelectedBlog,
  changeLikes,
  removeSelectedBlog,
} from "../utils/selectedBlogSlice";
import { setIsOpen } from "../utils/commentSlice";
import Comment from "../components/Comments";
import MoreOptionsDropdown from "../components/Dropdown/MoreOptionsDropdown";

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { token, _id: userId } = useSelector((state) => state.user);
  const isCommentOpen = useSelector((state) => state.comment.isOpen);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLike, setIsLike] = useState(false);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
      );
      const fetchedBlog = res.data.blog;
      console.log("📥 Blog fetched from server:", res.data.blog);

      setBlog(fetchedBlog);
      dispatch(addSelectedBlog(fetchedBlog));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (blog && userId) {
      const liked = blog.likes?.some((id) => id.toString() === userId);
      setIsLike(liked);
      console.log("❤️ isLike =", liked);
    }
  }, [blog, userId]);

  const handleLike = async () => {
    if (!token) return toast.error("Please sign in to like this blog");

    console.log("👆 Like button clicked");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blog.blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.isLiked;
      console.log("✅ Server responded. isLiked:", updated);

      setIsLike(updated);

      const updatedLikes = updated
        ? [...blog.likes, userId]
        : blog.likes.filter((id) => id.toString() !== userId);

      console.log("📦 Updated likes array:", updatedLikes);

      setBlog((prev) => ({
        ...prev,
        likes: updatedLikes,
      }));

      dispatch(addSelectedBlog({ ...blog, likes: updatedLikes }));

      toast.success(res.data.message);
    } catch (err) {
      console.error("❌ Failed to like blog", err);
      toast.error("Failed to like blog");
    }
  };

  useEffect(() => {
    fetchBlog();
    return () => dispatch(removeSelectedBlog());
  }, [id, dispatch]);

  const renderContent = (content) => {
    if (!content || !Array.isArray(content.blocks)) return null;

    return content.blocks.map((block, idx) => {
      if (!block || !block.type || !block.data) return null;

      switch (block.type) {
        case "header":
          return (
            <h2 key={idx} className="text-3xl font-bold mt-10 mb-4">
              {block.data.text}
            </h2>
          );
        case "paragraph":
          return (
            <p
              key={idx}
              className="text-lg leading-8 mb-6 text-gray-800 dark:text-gray-200"
            >
              {block.data.text}
            </p>
          );
        case "image": {
          const imageUrl = block.data?.file?.url;
          return imageUrl ? (
            <div key={idx} className="w-full my-8 flex justify-center">
              <img
                src={imageUrl}
                alt="Blog content"
                className="rounded-xl shadow-md max-w-full max-h-[70vh] object-contain"
              />
            </div>
          ) : null;
        }
        case "list":
          return (
            <ul
              key={idx}
              className="list-disc pl-6 mb-6 text-gray-800 dark:text-gray-200"
            >
              {block.data.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        default:
          return (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded mb-4"
            >
              ⚠️ Unsupported block type: <code>{block.type}</code>
            </div>
          );
      }
    });
  };

  if (loading) return <Spinner message="Loading blog..." />;
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-lg">Blog not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition duration-300">
      <div className={`${isCommentOpen ? "blur-sm" : ""} transition-all`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold leading-tight mb-2">
            {blog.title}
          </h1>
          <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400 mb-6">
            <span className="font-medium">
              {blog.creator?.name || blog.creator?.username || "Anonymous"}
            </span>
            <span>·</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span>
              {Math.ceil(blog.content?.blocks?.length / 3) || 2} min read
            </span>
          </div>

          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <hr className="border-t border-gray-400 dark:border-gray-700 " />

          <div className="flex justify-between items-center pt-4 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-6">
              <div
                onClick={handleLike}
                className="flex items-center gap-1 cursor-pointer hover:text-black dark:hover:text-white transition"
              >
                {console.log("❤️ isLike =", isLike)}
                <i
                  className={`${
                    isLike ? "fi fi-sr-heart text-red-500" : "fi fi-rr-heart"
                  } text-lg`}
                ></i>
                <span className="ml-1">
                  {blog.likes.length >= 1000
                    ? `${(blog.likes.length / 1000).toFixed(1)}K`
                    : blog.likes.length}
                </span>
              </div>

              <div
                onClick={() => dispatch(setIsOpen(true))}
                className="flex items-center gap-1 cursor-pointer hover:text-black dark:hover:text-white transition"
              >
                <i className="fi fi-rr-comment text-lg"></i>
                <span className="ml-1">
                  {blog.comments?.reduce(
                    (acc, comment) => acc + 1 + (comment.replies?.length || 0),
                    0
                  ) || 0}
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-6">
              <i className="fi fi-rr-bookmark text-lg cursor-pointer hover:text-black dark:hover:text-white transition"></i>
              <ShareDropdown />
              <MoreOptionsDropdown blogId={blog.blogId} />
            </div>
          </div>

          <hr className="border-t border-gray-400 dark:border-gray-700 my-4" />

          {blog.image && (
            <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden mb-10">
              <img
                src={blog.image}
                alt="Blog thumbnail"
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          )}

          <article className="prose dark:prose-invert prose-lg max-w-none">
            {blog.content?.blocks?.length > 0 ? (
              renderContent(blog.content)
            ) : (
              <p className="text-gray-400">No content available.</p>
            )}
          </article>

          {token && userId && blog?.creator?._id === userId && (
            <div className="mt-6 mb-6 flex justify-start">
              <Link
                to={`/edit-blog/${blog.blogId}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <span className="text-xl">✏️</span>
                <span>Edit Blog</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {isCommentOpen && <Comment />}
    </div>
  );
};

export default BlogDetail;
