const express = require("express");

const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
  uploadEditorImage,
  getUserBlogs,
} = require("../controllers/blogController");

const verifyUser = require("../middleware/auth");

const {
  addComment,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
  getComments,
} = require("../controllers/commentController");
const upload = require("../utils/multer");

const route = express.Router();

// blogs

route.post(
  "/blogs",
  verifyUser,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "images" }]),
  createBlog
);

route.post("/upload-image", verifyUser, upload.single("image"), uploadEditorImage);

route.get("/blogs", getBlogs);

route.get("/blogs/user", verifyUser, getUserBlogs);

route.get("/blogs/:id", getBlog);



route.put(
  "/blogs/:id",
  verifyUser,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "images" }]),
  updateBlog
);

route.delete("/blogs/:id", verifyUser, deleteBlog);

// Save/Unsave (Bookmark) Blog
route.patch("/save-blog/:id", verifyUser, saveBlog);

// Like
route.post("/blogs/like/:id", verifyUser, likeBlog);

// comment
route.post("/blogs/comment/:id", verifyUser, addComment);
route.delete("/blogs/comment/:id", verifyUser, deleteComment);
route.put("/blogs/edit-comment/:id", verifyUser, editComment);
route.patch("/blogs/like-comment/:id", verifyUser, likeComment);

// for nested comment
route.post("/comment/:parentCommentId/:id", verifyUser, addNestedComment);

route.get("/blogs/comment/:id", getComments);

module.exports = route;
