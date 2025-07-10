import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { useState } from "react";
import axios from "axios";
import {
  deleteCommentAndReply,
  setCommentLikes,
  setComments,
  setReplies,
  setUpdatedComments,
} from "../utils/selectedBlogSlice";
import { formatDate } from "../utils/formatDate";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Comment() {
  const dispatch = useDispatch();

  const [comment, setComment] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [currentEditComment, setCurrentEditComment] = useState(null);

  const {
    _id: blogId,
    comments,
    creator: { _id: creatorId },
  } = useSelector((state) => state.selectedBlog);

  const { token, id: userId } = useSelector((state) => state.user);

  async function handleComment() {
    if (!comment.trim()) return toast.error("Comment can't be empty");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogId}`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComment("");
      dispatch(setComments(res.data.newComment));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding comment");
    }
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-white dark:bg-gray-900 text-black dark:text-white z-50 border-l border-gray-300 dark:border-gray-700 shadow-lg overflow-y-auto p-5"
    >
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg sm:text-xl font-semibold">
          Comments ({comments?.length || 0})
        </h1>
        <i
          onClick={() => dispatch(setIsOpen(false))}
          className="fi fi-br-cross-small text-xl cursor-pointer hover:text-red-500"
        ></i>
      </div>

      <div className="my-4">
        <textarea
          value={comment}
          placeholder="Write a comment..."
          className="h-[100px] sm:h-[120px] resize-none shadow w-full p-3 text-base focus:outline-none border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={handleComment}
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2 mt-2 rounded transition"
        >
          Add Comment
        </button>
      </div>

      <div className="mt-6">
        <DisplayComments
          comments={comments}
          userId={userId}
          blogId={blogId}
          token={token}
          activeReply={activeReply}
          setActiveReply={setActiveReply}
          currentPopup={currentPopup}
          setCurrentPopup={setCurrentPopup}
          currentEditComment={currentEditComment}
          setCurrentEditComment={setCurrentEditComment}
          creatorId={creatorId}
        />
      </div>
    </motion.div>
  );
}

function DisplayComments({
  comments,
  userId,
  blogId,
  token,
  setActiveReply,
  activeReply,
  currentPopup,
  setCurrentPopup,
  currentEditComment,
  setCurrentEditComment,
  creatorId,
}) {
  const [reply, setReply] = useState("");
  const [updatedCommentContent, setUpdatedCommentContent] = useState("");
  const dispatch = useDispatch();

  async function handleReply(parentCommentId) {
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/comment/${parentCommentId}/${blogId}`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply("");
      setActiveReply(null);
      dispatch(setReplies(res.data.newReply));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add reply");
    }
  }

  async function handleCommentLike(commentId) {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setCommentLikes({ commentId, userId }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like comment");
    }
  }

  function handleActiveReply(id) {
    setActiveReply((prev) => (prev === id ? null : id));
  }

  async function handleCommentUpdate(id) {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/edit-comment/${id}`,
        { updatedCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(setUpdatedComments(res.data.updatedComment));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update comment");
    } finally {
      setUpdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  async function handleCommentDelete(id) {
    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      dispatch(deleteCommentAndReply(id));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    } finally {
      setUpdatedCommentContent("");
      setCurrentEditComment(null);
    }
  }

  return (
    <>
      {comments?.map((comment) => (
        <motion.div
          key={comment._id}
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Comment Display */}
          <div className="flex items-start gap-3 relative">
            <img
              src={
                comment.user?.profilePic ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`
              }
              alt={comment.user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${comment.user?._id}`}
                  className="font-semibold hover:underline"
                >
                  {comment.user?.name}
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-line text-gray-800 dark:text-gray-200">
                {comment.comment}
              </p>

              <div className="flex gap-4 text-sm mt-2 text-gray-600 dark:text-gray-400">
                <button
                  onClick={() => handleCommentLike(comment._id)}
                  className="flex items-center gap-1"
                >
                  <i
                    className={
                      comment.likes?.includes(userId)
                        ? "fi fi-sr-heart text-red-500"
                        : "fi fi-rr-heart"
                    }
                  ></i>
                  <span>{comment.likes?.length}</span>
                </button>

                <button onClick={() => handleActiveReply(comment._id)}>
                  Reply
                </button>

                {(comment.user?._id === userId || creatorId === userId) && (
                  <>
                    <button onClick={() => setCurrentEditComment(comment._id)}>
                      Edit
                    </button>
                    <button onClick={() => handleCommentDelete(comment._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Section */}
          <AnimatePresence>
            {currentEditComment === comment._id && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <textarea
                  value={updatedCommentContent}
                  className="w-full h-[120px] p-2 border dark:border-gray-600 shadow rounded resize-none dark:bg-gray-800 dark:text-white"
                  onChange={(e) => setUpdatedCommentContent(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => setCurrentEditComment(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={() => handleCommentUpdate(comment._id)}
                  >
                    Update
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply Section */}
          <AnimatePresence>
            {activeReply === comment._id && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <textarea
                  value={reply}
                  placeholder="Write a reply..."
                  className="w-full h-[100px] p-2 border dark:border-gray-600 shadow rounded resize-none dark:bg-gray-800 dark:text-white"
                  onChange={(e) => setReply(e.target.value)}
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  className="bg-green-500 text-white px-6 py-2 mt-2 rounded"
                >
                  Add Reply
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recursive Replies */}
          {comment.replies?.length > 0 && (
            <div className="pl-6 mt-4 border-l border-gray-300 dark:border-gray-600">
              <DisplayComments
                comments={comment.replies}
                userId={userId}
                blogId={blogId}
                token={token}
                activeReply={activeReply}
                setActiveReply={setActiveReply}
                currentPopup={currentPopup}
                setCurrentPopup={setCurrentPopup}
                currentEditComment={currentEditComment}
                setCurrentEditComment={setCurrentEditComment}
                creatorId={creatorId}
              />
            </div>
          )}
        </motion.div>
      ))}
    </>
  );
}

export default Comment;
