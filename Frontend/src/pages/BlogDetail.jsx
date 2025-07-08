import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Spinner from "../components/Common/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { addSelectedBlog } from "../utils/selectedBlogSlice";

const BlogDetail = () => {
  const {
    token,
    email,
    _id: userId,
    profilePic,
    following,
  } = useSelector((state) => state.user);
  console.log("token:", token);

  // const { likes, comments, content, creator } = useSelector(
  //   (state) => state.selectedBlog
  // );

  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("User id :- " + userId);
  console.log("blog creator id :- " + blog?.creator?._id);
  console.log("token:- " + token);

  const dispatch = useDispatch();

  const fetchBlog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
      );
      const fetchedBlog = res.data.blog;
      setBlog(fetchedBlog);
      dispatch(addSelectedBlog(fetchedBlog));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
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
        case "image": {
          const imageUrl = block.data?.file?.url;
          if (!imageUrl) return null;
          return (
            <div key={idx} className="w-full my-8 flex justify-center">
              <img
                src={block.data.file.url}
                alt="Blog content"
                className="rounded-xl shadow-md max-w-full max-h-[70vh] object-contain"
              />
            </div>
          );
        }
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

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 transition duration-300 text-gray-800 dark:text-white">
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
        {/* Blog Body */}
        <article className="prose dark:prose-invert prose-lg max-w-none">
          {renderContent(blog.content)}
        </article>
        {/* Comments Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          {blog.comments?.length > 0 ? (
            blog.comments.map((comment, idx) => (
              <div
                key={idx}
                className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 mb-4 bg-white dark:bg-gray-800"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-semibold">
                    {comment.user?.name || "User"}
                  </span>{" "}
                  @{comment.user?.username || "unknown"}
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  {comment.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
          )}
        </section>
        {/* Edit */}
        {token &&
          userId &&
          blog?.creator?._id &&
          userId === blog.creator._id && (
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
  );
};

export default BlogDetail;
