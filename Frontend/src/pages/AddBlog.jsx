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
import { removeSelectedBlog } from "../utils/selectedBlogSlice";

const AddBlog = () => {
  const editorjsRef = useRef(null);
  const token = useSelector((s) => s.user?.token);

  const [loading, setLoading] = useState(false);
  const [thumbUrl, setThumbUrl] = useState(""); 
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    tags: "",
    image: null,
    images: [],
    draft: false,
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------- input handlers ---------- */
  const handleChange = ({ target }) => {
    const { name, value, files, type } = target;
    if (type === "file") {
      if (name === "image") {
        setBlogData((p) => ({ ...p, image: files[0] }));
      } else {
        setBlogData((p) => ({ ...p, images: Array.from(files) }));
      }
    } else {
      setBlogData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleCheckbox = () => setBlogData((p) => ({ ...p, draft: !p.draft }));

  /* ---------- submit ---------- */
  const handlePostBlog = async () => {
    if (!editorjsRef.current) {
      toast.error("Editor not ready.");
      return;
    }

    setLoading(true);
    let editorData;
    try {
      editorData = await editorjsRef.current.save();
    } catch {
      toast.error("Failed to read editor content");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("content", JSON.stringify(editorData));
    formData.append(
      "tags",
      JSON.stringify(
        blogData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );
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
        tags: "",
        image: null,
        images: [],
        draft: false,
      });
      setThumbUrl("");
      navigate("/blogs");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EditorJS ---------- */
  const initEditor = () => {
    if (editorjsRef.current) return;

    editorjsRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Write your amazing blog...",
      data: { blocks: [] },
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
        List: { class: NestedList, inlineToolbar: true },
        Marker,
        Underline,
        Embed,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                const fd = new FormData();
                fd.append("image", image);
                try {
                  const { data } = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/upload-image`,
                    fd,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  return {
                    success: 1,
                    file: { url: data.file.url, imageId: data.file.imageId },
                  };
                } catch {
                  return { success: 0 };
                }
              },
            },
          },
        },
      },
      tunes: ["textVariant"],
    });
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    dispatch(removeSelectedBlog());
  }, [dispatch]);

  useEffect(() => {
    if (document.getElementById("editorjs") && !editorjsRef.current)
      initEditor();
    return () => {
      editorjsRef.current?.destroy?.();
      editorjsRef.current = null;
    };
  }, []);

  // preview for thumbnail
  useEffect(() => {
    if (!blogData.image) return;
    const url = URL.createObjectURL(blogData.image);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blogData.image]);

  if (!token) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl space-y-8">
        <h1 className="text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
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
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
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
            placeholder="A brief overview..."
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none"
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
            className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <div
            id="editorjs"
            className="min-h-[300px] pt-4 border rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thumbnail Image
          </label>
          <label
            htmlFor="image"
            className="block cursor-pointer border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt="Thumbnail"
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
            className={`w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 py-3 rounded-xl shadow-lg ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:from-purple-700 hover:to-pink-600"
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
