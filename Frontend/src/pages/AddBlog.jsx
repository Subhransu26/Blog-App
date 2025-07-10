import axios from "axios";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import TextVariantTune from "@editorjs/text-variant-tune";

const AddBlog = () => {
  const editorjsRef = useRef(null);
  const token = useSelector((slice) => slice.user?.token);
  const { content } = useSelector((slice) => slice.selectedBlog);

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

    if (editorjsRef.current) {
      try {
        const data = await editorjsRef.current.save();
        setBlogData((prev) => ({ ...prev, content: JSON.stringify(data) }));
      } catch (err) {
        toast.error("Failed to read editor content");
        setLoading(false);
        return;
      }
    }

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

    if (blogData.image) formData.append("image", blogData.image);
    blogData.images.forEach((img) => formData.append("images", img));

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
      toast.error(error?.response?.data?.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const initializeEditorjs = () => {
    editorjsRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write your amazing blog...",
      data: content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: { class: NestedList, config: {}, inlineToolbar: true },
        Marker: Marker,
        Underline: Underline,
        Embed: Embed,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => ({
                success: 1,
                file: { url: URL.createObjectURL(image), image },
              }),
            },
          },
        },
      },
      tunes: ["textVariant"],
      onChange: async () => {
        const data = await editorjsRef.current.save();
        setBlogData((prev) => ({ ...prev, content: JSON.stringify(data) }));
      },
    });
  };

  useEffect(() => {
    if (!editorjsRef.current) initializeEditorjs();
    return () => {
      if (editorjsRef.current?.destroy) {
        editorjsRef.current.destroy();
        editorjsRef.current = null;
      }
    };
  }, []);

  if (!token) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl transition-all space-y-8">
        <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 drop-shadow-md">
          Write a New Blog
        </h1>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Blog Title
          </label>
          <input
            type="text"
            name="title"
            value={blogData.title}
            onChange={handleChange}
            placeholder="title of the blog"
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={blogData.description}
            onChange={handleChange}
            rows={3}
            placeholder="A brief overview of the blog..."
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={blogData.tags}
            onChange={handleChange}
            placeholder="e.g. tech, react, startup"
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <div
            id="editorjs"
            className="min-h-[300px] pt-4 border rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white text-gray-800"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thumbnail Image
          </label>
          <label
            htmlFor="image"
            className="block cursor-pointer border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {blogData.image ? (
              <img
                src={URL.createObjectURL(blogData.image)}
                alt="Thumbnail Preview"
                className="mx-auto h-48 object-contain rounded-lg"
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Click to upload
              </p>
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

        {/* Draft */}
        <div className="flex items-center space-x-2">
          <input
            id="draft"
            type="checkbox"
            checked={blogData.draft}
            onChange={handleCheckbox}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="draft"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Save as Draft
          </label>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            onClick={handlePostBlog}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 py-3 rounded-xl shadow-lg transition-all duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
