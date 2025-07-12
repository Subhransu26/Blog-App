import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Spinner } from "../components/Common/Spinner";
import { useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import TextVariantTune from "@editorjs/text-variant-tune";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.user?.token);
  const selectedBlog = useSelector((state) => state.selectedBlog.selectedBlog);
  const editorjsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    tags: "",
    content: "",
    draft: false,
    image: null,
  });

  const [existingThumb, setExistingThumb] = useState("");
  const [newThumb, setNewThumb] = useState(null);

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
        content: JSON.stringify(blog.content),
        draft: blog.draft,
        image: null,
      });
      setExistingThumb(blog.image || "");
    } catch (error) {
      toast.error("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBlog || selectedBlog._id !== id) {
      fetchBlog();
    } else {
      const blog = selectedBlog;
      setBlogData({
        title: blog.title,
        description: blog.description,
        tags: blog.tags.join(", "),
        content: JSON.stringify(blog.content),
        draft: blog.draft,
        image: null,
      });
      setExistingThumb(blog.image || "");
      setLoading(false);
    }
  }, [id, selectedBlog]);

  useEffect(() => {
    if (!loading && blogData.content && !editorjsRef.current) {
      const parsedContent = JSON.parse(blogData.content);
      // Delay initialization to ensure #editorjs is in DOM
      setTimeout(() => {
        const editorHolder = document.getElementById("editorjs");
        if (editorHolder) initializeEditor(parsedContent);
      }, 0);
    }
    return () => {
      if (
        editorjsRef.current?.destroy &&
        typeof editorjsRef.current.destroy === "function"
      ) {
        editorjsRef.current.destroy();
        editorjsRef.current = null;
      }
    };
  }, [loading, blogData.content]);

  const initializeEditor = (content) => {
    editorjsRef.current = new EditorJS({
      holder: "editorjs",
      placeholder: "Edit your blog content here...",
      data: content,
      tools: {
        header: { class: Header, inlineToolbar: true },
        list: { class: NestedList, inlineToolbar: true },
        marker: Marker,
        underline: Underline,
        embed: Embed,
        textVariant: TextVariantTune,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file) => {
                // Real upload example to Cloudinary (replace with your own config)
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "your_upload_preset");

                try {
                  const response = await fetch(
                    "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
                    {
                      method: "POST",
                      body: formData,
                    }
                  );
                  const data = await response.json();
                  return {
                    success: 1,
                    file: {
                      url: data.secure_url,
                    },
                  };
                } catch (error) {
                  toast.error("Image upload failed");
                  return { success: 0 };
                }
              },
            },
          },
        },
      },
      tunes: ["textVariant"],
      onChange: async () => {
        const content = await editorjsRef.current.save();
        setBlogData((prev) => ({
          ...prev,
          content: JSON.stringify(content),
        }));
      },
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setBlogData({ ...blogData, [name]: checked });
    } else if (type === "file" && name === "image") {
      const file = files[0];
      setBlogData({ ...blogData, image: file });
      setNewThumb(URL.createObjectURL(file));
    } else {
      setBlogData({ ...blogData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || submitting) return;

    if (!blogData.content) {
      toast.error("Blog content cannot be empty");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append(
      "tags",
      JSON.stringify(blogData.tags.split(",").map((t) => t.trim()))
    );
    formData.append("content", blogData.content);
    formData.append("draft", blogData.draft);
    if (blogData.image) formData.append("image", blogData.image);

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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner message="Fetching blog details..." />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-6 py-12 text-gray-800 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Edit Blog</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-8"
        >
          <div>
            <label className="block text-lg font-semibold mb-2">Title</label>
            <input
              name="title"
              value={blogData.title}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog title"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={blogData.description}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Brief description of your blog"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Tags</label>
            <input
              name="tags"
              value={blogData.tags}
              onChange={handleChange}
              className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Comma-separated tags (e.g., react, dev, ai)"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Content</label>
            <div
              id="editorjs"
              className="min-h-[300px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">Thumbnail</label>
            <div className="mb-4">
              {newThumb ? (
                <img src={newThumb} alt="New Thumbnail" className="w-48 rounded-lg shadow-md" />
              ) : existingThumb ? (
                <img src={existingThumb} alt="Existing Thumbnail" className="w-48 rounded-lg shadow-md" />
              ) : null}
            </div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="file:bg-blue-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-0 file:cursor-pointer bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="draft"
              checked={blogData.draft}
              onChange={handleChange}
              className="accent-blue-600 scale-125"
            />
            <label className="text-lg font-medium">Save as Draft</label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 text-lg font-semibold rounded-lg transition-all duration-200 ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white shadow-lg`}
          >
            {submitting ? "Updating..." : "Update Blog"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full mt-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
