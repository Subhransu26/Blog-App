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
  const token = useSelector((slice) => slice.user?.token);

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
    if (editorjsRef.current) return;

    const editor = new EditorJS({
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
        Marker: Marker,
        Underline: Underline,
        Embed: Embed,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (image) => {
                const formData = new FormData();
                formData.append("file", image);
                formData.append("upload_preset", "your_upload_preset"); 
                formData.append("cloud_name", "your_cloud_name"); 
                formData.append("folder", "blog_inline_images");

                try {
                  const res = await fetch(
                    "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", // 🔁 change this
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const data = await res.json();
                  if (data.secure_url) {
                    return {
                      success: 1,
                      file: { url: data.secure_url },
                    };
                  } else {
                    throw new Error("Upload failed");
                  }
                } catch (err) {
                  console.error("Image upload failed:", err);
                  return { success: 0 };
                }
              },
            },
          },
        },
      },
      tunes: ["textVariant"],
      onReady: () => {
        editorjsRef.current = editor;
      },
      onChange: async () => {
        const data = await editor.save();
        setBlogData((prev) => ({ ...prev, content: JSON.stringify(data) }));
      },
    });
  };

  useEffect(() => {
    dispatch(removeSelectedBlog());
  }, [dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (document.getElementById("editorjs") && !editorjsRef.current) {
        initializeEditorjs();
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
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
        <input
          type="text"
          name="title"
          value={blogData.title}
          onChange={handleChange}
          placeholder="Blog Title"
          className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />

        {/* Description */}
        <textarea
          name="description"
          value={blogData.description}
          onChange={handleChange}
          placeholder="A brief overview of the blog..."
          rows={3}
          className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
        />

        {/* Tags */}
        <input
          type="text"
          name="tags"
          value={blogData.tags}
          onChange={handleChange}
          placeholder="e.g. tech, react, startup"
          className="w-full p-3 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        />

        {/* Content */}
        <div id="editorjs" className="min-h-[300px] p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700" />

        {/* Thumbnail */}
        <label htmlFor="image" className="block mt-4">
          {blogData.image ? (
            <img
              src={URL.createObjectURL(blogData.image)}
              alt="Thumbnail Preview"
              className="h-48 w-auto mx-auto object-contain rounded-lg"
            />
          ) : (
            <div className="border-2 border-dashed p-4 text-center rounded-lg text-gray-500 dark:text-gray-400">
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

        {/* Draft Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            id="draft"
            type="checkbox"
            checked={blogData.draft}
            onChange={handleCheckbox}
            className="w-4 h-4 text-purple-600 rounded border-gray-300"
          />
          <label htmlFor="draft" className="text-sm text-gray-700 dark:text-gray-300">
            Save as Draft
          </label>
        </div>

        {/* Submit Button */}
        <button
          onClick={handlePostBlog}
          disabled={loading}
          className={`w-full mt-4 text-lg font-semibold text-white py-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Publishing..." : "Publish Blog"}
        </button>
      </div>
    </div>
  );
};

export default AddBlog;
