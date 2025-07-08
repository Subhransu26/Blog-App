import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  creator: { _id: "" },
  likes: [],
  comments: [],
  _id: "",
  title: "",
  content: [],
  image: "",
};

const selectedBlogSlice = createSlice({
  name: "selectedBlogSlice",
  initialState,
  reducers: {
    addSelectedBlog(state, action) {
      return action.payload;
    },

    removeSelectedBlog() {
      return initialState;
    },

    changeLikes(state, action) {
      const userId = action.payload;
      if (state.likes.includes(userId)) {
        state.likes = state.likes.filter((id) => id !== userId);
      } else {
        state.likes.push(userId);
      }
    },

    setComments(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    setCommentLikes(state, action) {
      const { commentId, userId } = action.payload;

      function toggleLike(comments) {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            const hasLiked = comment.likes.includes(userId);
            return {
              ...comment,
              likes: hasLiked
                ? comment.likes.filter((id) => id !== userId)
                : [...comment.likes, userId],
            };
          }

          if (comment.replies?.length > 0) {
            return { ...comment, replies: toggleLike(comment.replies) };
          }

          return comment;
        });
      }

      state.comments = toggleLike(state.comments);
    },

    setReplies(state, action) {
      const newReply = action.payload;

      function insertReply(comments) {
        return comments.map((comment) => {
          if (comment._id === newReply.parentComment) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }

          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: insertReply(comment.replies),
            };
          }

          return comment;
        });
      }

      state.comments = insertReply(state.comments);
    },

    setUpdatedComments(state, action) {
      const updatedComment = action.payload;

      function updateComment(comments) {
        return comments.map((comment) => {
          if (comment._id === updatedComment._id) {
            return { ...comment, comment: updatedComment.comment };
          }

          if (comment.replies?.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies),
            };
          }

          return comment;
        });
      }

      state.comments = updateComment(state.comments);
    },

    deleteCommentAndReply(state, action) {
      const commentIdToDelete = action.payload;

      function deleteComment(comments) {
        return comments
          .filter((comment) => comment._id !== commentIdToDelete)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.length
              ? deleteComment(comment.replies)
              : [],
          }));
      }

      state.comments = deleteComment(state.comments);
    },
  },
});

export const {
  addSelectedBlog,
  removeSelectedBlog,
  changeLikes,
  setComments,
  setCommentLikes,
  setReplies,
  deleteCommentAndReply,
  setUpdatedComments,
} = selectedBlogSlice.actions;

export default selectedBlogSlice.reducer;
