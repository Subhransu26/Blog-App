const mongoose = require("mongoose");

const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");

// Add Comment
// POST /api/v1/blogs/comment/:id
const addComment = async (req, res) => {
  try {
    const { comment, parentComment } = req.body;
    const blogId = req.params.id;

    // Ensure blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // Create new comment
    const newComment = await Comment.create({
      comment,
      blog: blogId,
      user: req.user._id,
      parentComment: parentComment || null,
    });

    // Push comment into blog's comment array
    blog.comments.push(newComment._id);
    await blog.save();

    // Populate user and nested replies
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "name email profilePic")
      .populate("parentComment")
      .populate({
        path: "replies",
        populate: { path: "user", select: "name email profilePic" },
      });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: populatedComment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Delete Comment
// DELETE /api/v1/blogs/comment/:id
async function deleteComment(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: comment._id },
    });

    // Optional: Delete all direct replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("deleteComment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting comment",
    });
  }
}

// Edit Comment
// PUT /api/v1/blogs/edit-comment/:id
async function editComment(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot be empty",
      });
    }

    const existingComment = await Comment.findById(id);
    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (existingComment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    existingComment.comment = comment.trim();
    await existingComment.save();

    const updatedComment = await Comment.findById(id).populate(
      "user",
      "name username profilePic"
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("editComment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while editing comment",
    });
  }
}

// Like Comment
// POST /api/v1/blogs/like-comment/:id
async function likeComment(req, res) {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(userId);

    if (!alreadyLiked) {
      comment.likes.push(userId);
    } else {
      comment.likes.pull(userId);
    }

    await comment.save();
    await comment.populate("likes", "name");

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      data: {
        likesCount: comment.likes.length,
        likes: comment.likes,
      },
    });
  } catch (error) {
    console.error("likeComment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while liking comment",
    });
  }
}

// Nested Comment
// request :- post
// route :- /api/v1/blogs/:blogId/comments/:parentCommentId
async function addNestedComment(req, res) {
  const { parentCommentId, blogId } = req.params;
  const { reply } = req.body;
  const userId = req.user?._id;

  if (!reply || !reply.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Reply cannot be empty" });
  }

  try {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({ success: false, message: "Parent comment not found" });
    }

    const newReply = await Comment.create({
      comment: reply,
      user: userId,
      blog: blogId,
      parentComment: parentCommentId,
    });

    parentComment.replies.push(newReply._id);
    await parentComment.save();

    const populatedReply = await Comment.findById(newReply._id)
      .populate("user", "name profilePic")
      .populate("parentComment", "comment user")
      .lean();

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: populatedReply,
    });
  } catch (err) {
    console.error("addNestedComment error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while adding reply" });
  }
}

// Get All Comments for a Blog
// GET /api/v1/blogs/comments/:id
async function getComments(req, res) {
  try {
    const { id: blogId } = req.params;

    const comments = await Comment.find({ blog: blogId, parentComment: null })
      .populate("user", "name username profilePic")
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "name username profilePic",
        },
      });

    return res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    console.error("getComments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
}

module.exports = {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
  getComments,
};
