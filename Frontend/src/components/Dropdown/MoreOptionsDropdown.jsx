import { Menu } from "@headlessui/react";
import { FaTrash, FaCopy, FaEllipsisV } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { SmallSpinner } from "../Common/Spinner";
import ConfirmModal from "../Common/ConfirmModal";

const MoreOptionsDropdown = ({ blogId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const token = useSelector((state) => state.user?.token);
  const navigate = useNavigate();

  const blogUrl = window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const confirmDelete = () => setShowConfirm(true);

  const handleDelete = async () => {
    setIsDeleting(true);
    

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Blog deleted successfully!");
      navigate("/");
    } catch (err) {
      console.error("Delete blog error:", err);
      toast.error(err.response?.data?.message || "Failed to delete blog");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="text-lg hover:text-black dark:hover:text-white transition focus:outline-none">
          <FaEllipsisV />
        </Menu.Button>

        <Menu.Items className="absolute bottom-full mb-2 right-0 w-48 origin-bottom-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <Menu.Item>
              {() => (
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaCopy />
                  Copy Link
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {() => (
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm ${
                    isDeleting
                      ? "opacity-50 cursor-wait"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <SmallSpinner />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
                    </>
                  )}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        message="Are you sure you want to delete this blog?"
      />
    </>
  );
};

export default MoreOptionsDropdown;
