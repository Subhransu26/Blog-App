import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Spinner from "../components/Common/Spinner";
import ShareDropdown from "../components/ShareDropdown";
import {
  addSelectedBlog,
  changeLikes,
  removeSelectedBlog,
} from "../utils/selectedBlogSlice";
import { setIsOpen } from "../utils/commentSlice";
import Comment from "../components/Comments";

const BlogDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    token,
    email,
    _id: userId,
    profilePic,
    following,
  } = useSelector((state) => state.user);

  const { likes, comments, content, creator } = useSelector(
    (state) => state.selectedBlog
  );

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLike, setIsLike] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const isCommentOpen = useSelector((state) => state.comment.isOpen);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
      );

      const fetchedBlog = res.data.blog;
      setBlog(fetchedBlog);
      dispatch(addSelectedBlog(fetchedBlog));

      setIsLike(fetchedBlog.likes.includes(userId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  // Handle Like
  const handleLike = async () => {
    if (!token) return toast.error("Please sign in to like this blog");

    setIsLike((prev) => !prev);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blog.blogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(changeLikes(userId));
      toast.success(res.data.message);
      setBlog((prevBlog) => {
        const updatedLikes = isLike
          ? prevBlog.likes.filter((id) => id !== userId)
          : [...prevBlog.likes, userId];

        return {
          ...prevBlog,
          likes: updatedLikes,
        };
      });
    } catch (err) {
      toast.error("Failed to like blog");
    }
  };

  useEffect(() => {
    fetchBlog();
    return () => {
      dispatch(removeSelectedBlog());
    };
  }, [id]);

  const renderContent = (content) => {
    if (!content || !Array.isArray(content.blocks)) return null;

    return content.blocks.map((block, idx) => {
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
        case "image":
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
        default:
          return null;
      }
    });
  };

  if (loading) {
    return <Spinner message="Loading blog..." />;
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-lg">Blog not found.</p>
      </div>
    );
  }

  const handleShare = () => {
    const blogUrl = window.location.href; // or `/blogs/${blogId}` if not on blog page

    navigator.clipboard
      .writeText(blogUrl)
      .then(() => {
        toast.success("Blog link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 transition duration-300 text-gray-800 dark:text-white">
      <div className={`${isCommentOpen ? "blur-sm" : ""} transition-all`}>
        <div className="max-w-3xl mx-auto">
          {/* Title & Metadata */}
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

          {/* Tags */}
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

          {/* Like & Comment */}
          <hr className="border-t border-gray-400 dark:border-gray-700 " />

          <div className="flex justify-between items-center pt-4 text-gray-500 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-6">
              {/* Like */}
              <div
                onClick={handleLike}
                className="flex items-center gap-1 cursor-pointer hover:text-black dark:hover:text-white transition"
              >
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

              {/* Comments */}
              <div
                onClick={() => dispatch(setIsOpen(true))}
                className="flex items-center gap-1 cursor-pointer hover:text-black dark:hover:text-white transition"
              >
                <i className="fi fi-rr-comment text-lg"></i>
                <span className="ml-1">{blog.comments?.length || 0}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <i className="fi fi-rr-bookmark-add text-lg cursor-pointer hover:text-black dark:hover:text-white transition"></i>
              <i className="fi fi-rr-play text-lg cursor-pointer hover:text-black dark:hover:text-white transition"></i>

              <ShareDropdown />
              <i className="fi fi-rr-menu-dots-vertical text-lg cursor-pointer hover:text-black dark:hover:text-white transition"></i>
            </div>
          </div>

          <hr className="border-t border-gray-400 dark:border-gray-700 my-4" />

          {/* Thumbnail */}
          {blog.image && (
            <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden mb-10">
              <img
                src={blog.image}
                alt="Blog thumbnail"
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
          )}

          {/* Content */}
          <article className="prose dark:prose-invert prose-lg max-w-none">
            {renderContent(blog.content)}
          </article>

          {/* Edit Button */}
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

      {/* Comment Drawer */}
      {isCommentOpen && <Comment />}
    </div>
  );
};

export default BlogDetail;
