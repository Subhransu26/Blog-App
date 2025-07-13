/*  ─────────────  Comment side‑panel  ─────────────  */
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { setIsOpen } from "../utils/commentSlice";
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";
import { formatDate } from "../utils/formatDate";

export default function Comment() {
  const dispatch = useDispatch();

  /* local state */
  const [comment, setComment] = useState("");

  /* global state */
  const {
    _id: blogId,
    comments,
    creator: { _id: creatorId },
  } = useSelector((s) => s.selectedBlog);
  const { token, id: userId } = useSelector((s) => s.user);

  /* ── create top‑level comment */
  const handleComment = async () => {
    if (!comment.trim()) return toast.error("Comment can't be empty");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setComments(data.data || data.newComment));
      setComment("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding comment");
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[400px] overflow-y-auto border-l border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
    >
      <header className="mb-3 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">
          Comments ({comments?.length ?? 0})
        </h1>
        <i
          className="fi fi-br-cross-small cursor-pointer text-xl hover:text-red-500"
          onClick={() => dispatch(setIsOpen(false))}
        />
      </header>

      <div className="my-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="h-[100px] sm:h-[120px] w-full resize-none rounded border border-gray-300 p-3 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
        />
        <button
          onClick={handleComment}
          className="mt-2 w-full sm:w-auto rounded bg-green-500 px-6 py-2 text-white transition hover:bg-green-600"
        >
          Add Comment
        </button>
      </div>

      <DisplayComments
        comments={comments}
        blogId={blogId}
        userId={userId}
        token={token}
        creatorId={creatorId}
      />
    </motion.div>
  );
}

/*  ──────────  recursive comment tree  ──────────  */
function DisplayComments({
  comments = [],
  blogId,
  userId,
  token,
  creatorId,
}) {
  const dispatch = useDispatch();

  /* local UI state (per branch) */
  const [replyBox, setReplyBox] = useState(null);          // comment._id currently replying to
  const [editBox, setEditBox] = useState(null);            // comment._id currently editing
  const [reply, setReply] = useState("");
  const [editText, setEditText] = useState("");

  const axiosAuth = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* endpoints ------------------------------------------------ */
  const replyURL = (parentId) =>
    `${import.meta.env.VITE_BACKEND_URL}/blogs/${blogId}/comments/${parentId}/reply`;

  /* handlers ------------------------------------------------- */
  const addReply = async (parentId) => {
    if (!reply.trim()) return toast.error("Reply cannot be empty");
    try {
      const { data } = await axios.post(replyURL(parentId), { reply }, axiosAuth);
      dispatch(setReplies(data.data || data.newReply));
      setReply("");
      setReplyBox(null);
      toast.success("Reply added");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add reply");
    }
  };

  const likeComment = async (id) => {
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${id}`,
        {},
        axiosAuth
      );
      dispatch(setCommentLikes({ commentId: id, userId }));
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to like comment");
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return toast.error("Updated comment cannot be empty");
    try {
      const { data } = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${id}`,
        { updatedCommentContent: editText },
        axiosAuth
      );
      dispatch(setUpdatedComments(data.data || data.updatedComment));
      setEditBox(null);
      setEditText("");
      toast.success("Updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update comment");
    }
  };

  const deleteComment = async (id) => {
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
        axiosAuth
      );
      dispatch(deleteCommentAndReply(id));
      toast.success(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  /* render one branch --------------------------------------- */
  return (
    <>
      {comments.map((c) => (
        <motion.div
          key={c._id}
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* comment header */}
          <div className="flex items-start gap-3">
            <img
              src={
                c.user?.profilePic ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${c.user?.name || "U"}`
              }
              alt={c.user?.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${c.user?._id}`}
                  className="font-semibold hover:underline"
                >
                  {c.user?.name || "Unknown"}
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(c.createdAt)}
                </span>
              </div>

              <p className="mt-1 whitespace-pre-line">{c.comment}</p>

              {/* action row */}
              <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <button onClick={() => likeComment(c._id)} className="flex items-center gap-1">
                  <i
                    className={
                      c.likes?.includes(userId) ? "fi fi-sr-heart text-red-500" : "fi fi-rr-heart"
                    }
                  />
                  <span>{c.likes?.length}</span>
                </button>

                <button onClick={() => setReplyBox(c._id)}>Reply</button>

                {(c.user?._id === userId || creatorId === userId) && (
                  <>
                    <button
                      onClick={() => {
                        setEditBox(c._id);
                        setEditText(c.comment);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteComment(c._id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* edit textarea */}
          <AnimatePresence>
            {editBox === c._id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3"
              >
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-[120px] resize-none rounded border p-2 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    className="rounded bg-red-500 px-4 py-2 text-white"
                    onClick={() => setEditBox(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded bg-green-600 px-4 py-2 text-white"
                    onClick={() => saveEdit(c._id)}
                  >
                    Update
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* reply textarea */}
          <AnimatePresence>
            {replyBox === c._id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3"
              >
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full h-[100px] resize-none rounded border p-2 dark:border-gray-600 dark:bg-gray-800"
                />
                <button
                  onClick={() => addReply(c._id)}
                  className="mt-2 rounded bg-green-500 px-6 py-2 text-white"
                >
                  Add Reply
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* nested replies */}
          {c.replies?.length > 0 && (
            <div className="mt-4 pl-6 border-l border-gray-300 dark:border-gray-600">
              <DisplayComments
                comments={c.replies}
                blogId={blogId}
                userId={userId}
                token={token}
                creatorId={creatorId}
              />
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
}
