const mongoose = require("mongoose");

const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");

// Add Comment
// request :- Post
// route :- /api/v1/blogs/comment/:id
async function addComment(req, res) {
  try {
    const creator = req.user.id;
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Please enter the comment",
      });
    }

    const blog = await Blog.findById(id);
    // console.log("Blog found:", blog);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Check for duplicate comment by the same user on the same blog
    const existingComment = await Comment.findOne({
      blog: blog._id,
      user: creator,
      comment: comment.trim(),
    });

    if (existingComment) {
      return res.status(409).json({
        success: false,
        message: "You already posted this exact comment on this blog.",
      });
    }

    // Create new Comment
    const newComment = await Comment.create({
      comment,
      blog: blog._id,
      user: creator,
    }).then((comment) => {
      return comment.populate({
        path: "user",
        select: "name email username profilePic",
      });
    });

    // Push to Blog
    await Blog.findByIdAndUpdate(blog._id, {
      $push: { comments: newComment._id },
    });

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      newComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete Comment
// request :- Delete
// route :- /api/v1/blogs/comment/:id
async function deleteComment(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // Comment id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Authorization check :- only allowing the user who made the comment
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // Remove comment from the Blog
    await Blog.findByIdAndUpdate(comment.blog, {
      $pull: { comments: new mongoose.Types.ObjectId(comment._id) },
    });

    // Delete Comment
    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// Edit Comment
// request :- put
// route :- /api/v1/blogs/edit-comment/:id
async function editComment(req, res) {
  try {
    const userId = req.user.id;
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

    // Check existing comment
    const existingComment = await Comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Authorization Check
    if (existingComment.user.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "Not authorized to edit this comment",
      });
    }

    existingComment.comment = comment || existingComment.comment;
    await existingComment.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated Successfully",
      comment: existingComment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Like Comment
// request :- post
// route :- /api/v1/blogs/like-comment/:id
async function likeComment(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // comment id
    // const { comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if already Liked
    const alreadyLiked = comment.likes.includes(userId);

    if (!alreadyLiked) {
      comment.likes.push(userId); // comment Liked
    } else {
      comment.likes.pull(userId); // comment unLiked
    }

    await comment.save();
    await comment.populate({
      path: "likes",
      select: "name",
    });

    return res.status(200).json({
      success: true,
      message: !alreadyLiked ? "Comment Liked" : "Comment unLiked",
      likesCount: comment.likes.length,
      likes: comment.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// nested comment
// request :- POST
// route :- /api/v1//comment/:parentCommentId/:id
async function addNestedComment(req, res) {
  const { parentCommentId, id: blogId } = req.params;
  const { reply } = req.body;
  const userId = req.user.id;

  if (!reply || !reply.trim()) {
    return res.status(400).json({ message: "Reply cannot be empty" });
  }

  try {
    // Find the parent comment
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Create new nested comment
    const newReply = await Comment.create({
      comment: reply,
      user: userId,
      blog: blogId,
      parentComment: parentCommentId,
    });

    // Add this reply to parent comment's replies array
    parentComment.replies.push(newReply._id);
    await parentComment.save();

    const populatedReply = await Comment.findById(newReply._id)
      .populate("user", "name avatar")
      .lean();

    res.status(201).json({
      message: "Reply added successfully",
      newReply: populatedReply,
    });
  } catch (err) {
    console.error("Error in addNestedComment:", err.message);
    res.status(500).json({ message: "Server error while adding reply" });
  }
}

module.exports = {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
};
