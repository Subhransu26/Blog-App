import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";

const AddBlog = () => {
  const token = useSelector((slice) => slice.user);
  const { title, description, image, content, draft, tags } = useSelector(
    (slice) => slice.selectedBlog
  );

  const [loading, setLoading] = useState(false);

  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
    image: null,
    images: [],
    draft: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      if (name === "image") {
        setBlogData((prev) => ({ ...prev, image: files[0] }));
      } else {
        setBlogData((prev) => ({ ...prev, images: Array.from(files) }));
      }
    } else {
      setBlogData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckbox = () => {
    setBlogData((prev) => ({ ...prev, draft: !prev.draft }));
  };

  const handlePostBlog = async () => {
    setLoading(true);
    const formData = new FormData();

    formData.append("title", blogData.title);
    formData.append("description", blogData.description);

    try {
      const parsedContent = JSON.parse(blogData.content);
      formData.append("content", JSON.stringify(parsedContent));
    } catch (err) {
      toast.error("Content must be valid JSON.");
      setLoading(false);
      return;
    }

    const tagArray = blogData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    formData.append("tags", JSON.stringify(tagArray));
    formData.append("draft", blogData.draft);

    if (blogData.image) {
      formData.append("image", blogData.image);
    }

    if (blogData.images.length > 0) {
      for (let i = 0; i < blogData.images.length; i++) {
        formData.append("images", blogData.images[i]);
      }
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);

      // Optional: reset form
      setBlogData({
        title: "",
        description: "",
        content: "",
        tags: "",
        image: null,
        images: [],
        draft: false,
      });

      navigate("/blogs");
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong.";
      toast.error(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return token == null ? (
    <Navigate to={"/login"} />
  ) : (
    <div className="min-h-screen px-4 py-10 bg-gray-100 dark:bg-gray-900 transition duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
          Create New Blog
        </h1>

        {/* Title */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={blogData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter blog title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={blogData.description}
            onChange={handleChange}
            rows={3}
            className="resize-none w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Write a short description..."
          ></textarea>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={blogData.tags}
            onChange={handleChange}
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. tech, coding, life"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Content (JSON)
          </label>
          <textarea
            name="content"
            value={blogData.content}
            onChange={handleChange}
            rows={10}
            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-y-scroll no-scrollbar"
            placeholder="Paste Editor.js content here as JSON"
          ></textarea>
        </div>

        {/* Thumbnail Image */}
        <div>
          <label
            htmlFor="image"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Thumbnail Image
          </label>

          <label
            htmlFor="image"
            className="group relative block w-full cursor-pointer border border-dashed border-gray-400 dark:border-gray-600 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {blogData.image ? (
              <img
                src={URL.createObjectURL(blogData.image)}
                alt="Thumbnail Preview"
                className="mx-auto h-48 w-auto object-contain rounded-md"
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                Click to upload thumbnail
              </div>
            )}
          </label>

          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>

        {/* Inline Content Images */}
        <div>
          <label
            htmlFor="images"
            className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
          >
            Inline Content Images
          </label>

          <label
            htmlFor="images"
            className="block w-full border border-dashed border-gray-400 dark:border-gray-600 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex flex-wrap gap-3">
              {blogData.images && blogData.images.length > 0 ? (
                blogData.images.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`Inline Image ${idx + 1}`}
                    className="h-28 w-auto object-contain rounded-md"
                  />
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  Click to upload one or more inline images
                </div>
              )}
            </div>
          </label>

          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </div>

        {/* Draft Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="draft"
            checked={blogData.draft}
            onChange={handleCheckbox}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="draft" className="text-gray-700 dark:text-gray-300">
            Save as Draft
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 text-center">
          <button
            onClick={handlePostBlog}
            disabled={loading}
            className={`w-full min-w-[150px] h-12 flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              "Submit Blog"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
