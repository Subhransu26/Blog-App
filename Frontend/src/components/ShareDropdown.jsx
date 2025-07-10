// components/ShareDropdown.jsx
import { Menu } from "@headlessui/react";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaCopy,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ShareDropdown = () => {
  const blogUrl = window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button>
        <i className="fi fi-rr-share text-lg cursor-pointer hover:text-black dark:hover:text-white transition"></i>
      </Menu.Button>

      <Menu.Items className="absolute bottom-full mb-2 right-0 w-56 origin-bottom-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div className="py-1">
          <Menu.Item>
            {() => (
              <button
                onClick={copyLink}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaCopy />
                Copy link
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {() => (
              <button
                onClick={() =>
                  openInNewTab(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      blogUrl
                    )}`
                  )
                }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTwitter />
                Share on X
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {() => (
              <button
                onClick={() =>
                  openInNewTab(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      blogUrl
                    )}`
                  )
                }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaFacebook />
                Share on Facebook
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {() => (
              <button
                onClick={() =>
                  openInNewTab(
                    `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
                      blogUrl
                    )}`
                  )
                }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaLinkedin />
                Share on LinkedIn
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {() => (
              <button
                onClick={() =>
                  openInNewTab(
                    `https://wa.me/?text=${encodeURIComponent(blogUrl)}`
                  )
                }
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaWhatsapp />
                Share on WhatsApp
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default ShareDropdown;
