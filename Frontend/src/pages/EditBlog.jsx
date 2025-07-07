import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("token"));

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    tags: "",
    content: "",
    draft: false,
    image: null,
    images: [],
  });

  const [existingThumb, setExistingThumb] = useState("");
  const [existingInlineImages, setExistingInlineImages] = useState([]);
  const [newThumb, setNewThumb] = useState(null);
  const [newInline, setNewInline] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
      );
      const blog = res.data.blog;
      setBlogData({
        title: blog.title,
        description: blog.description,
        tags: blog.tags.join(", "),
        content: JSON.stringify(blog.content, null, 2),
        draft: blog.draft,
        image: null,
        images: [],
      });
      setExistingThumb(blog.image || "");

      const inlineImages = blog.content.blocks
        .filter((block) => block.type === "image" && block.data?.file?.url)
        .map((block) => block.data.file.url);
      setExistingInlineImages(inlineImages);
    } catch (error) {
      toast.error("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setBlogData({ ...blogData, [name]: checked });
    } else if (type === "file") {
      if (name === "image") {
        const file = files[0];
        setBlogData({ ...blogData, image: file });
        setNewThumb(URL.createObjectURL(file));
      } else if (name === "images") {
        const filesArray = Array.from(files);
        setBlogData({ ...blogData, images: filesArray });
        setNewInline(filesArray.map((f) => URL.createObjectURL(f)));
      }
    } else {
      setBlogData({ ...blogData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append(
      "tags",
      JSON.stringify(blogData.tags.split(",").map((tag) => tag.trim()))
    );
    formData.append("content", blogData.content);
    formData.append("draft", blogData.draft);

    if (blogData.image) formData.append("image", blogData.image);
    blogData.images.forEach((img) => formData.append("images", img));

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(res.data.message);
      navigate(`/blogs/${res.data.blog.blogId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600 dark:text-gray-300">
        Loading...
      </p>
    );

  return (
    <div className="min-h-screen px-4 py-10 bg-white dark:bg-gray-900 transition duration-300 text-gray-800 dark:text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Edit Blog</h1>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-800 dark:text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          <svg
            className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block font-semibold">Title</label>
            <input
              name="title"
              value={blogData.title}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-800 text-white dark:bg-gray-700"
            />
          </div>

          {/* Description*/}
          <div>
            <label className="block font-semibold">Description</label>
            <textarea
              name="description"
              value={blogData.description}
              onChange={handleChange}
              rows={3}
              className="resize-none w-full p-3 rounded bg-gray-800 text-white dark:bg-gray-700"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-semibold">
              Tags (comma separated)
            </label>
            <input
              name="tags"
              value={blogData.tags}
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-800 text-white dark:bg-gray-700"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block font-semibold">
              Content (EditorJS JSON)
            </label>
            <textarea
              name="content"
              value={blogData.content}
              onChange={handleChange}
              rows={8}
              className="resize-none overflow-y-scroll no-scrollbar w-full p-3 rounded bg-gray-800 text-white dark:bg-gray-700 font-mono text-sm"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block font-semibold">Thumbnail</label>
            {newThumb ? (
              <img
                src={newThumb}
                alt="New Thumbnail"
                className="w-48 h-auto my-2 rounded-md"
              />
            ) : existingThumb ? (
              <img
                src={existingThumb}
                alt="Current Thumbnail"
                className="w-48 h-auto my-2 rounded-md"
              />
            ) : (
              <p className="text-sm text-gray-500">No thumbnail</p>
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="text-white mt-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Inline Images</label>
            <div className="flex gap-2 flex-wrap my-2">
              {newInline.length > 0
                ? newInline.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`New Inline ${idx}`}
                      className="w-28 h-28 object-cover rounded"
                    />
                  ))
                : existingInlineImages.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Inline ${idx}`}
                      className="w-28 h-28 object-cover rounded"
                    />
                  ))}
            </div>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="draft"
              checked={blogData.draft}
              onChange={handleChange}
            />
            <label>Save as Draft</label>
          </div>

          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Blog"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
