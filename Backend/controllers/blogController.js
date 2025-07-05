const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { v4: uuidv4 } = require("uuid");
// const ShortUniqueId = require("short-unique-id");
// const { randomUUID } = new ShortUniqueId({ length: 10 });
const {
  uploadImage,
  deleteImagefromCloudinary,
} = require("../utils/uploadImage");

// create Blog
// request :- post
// route :- /api/v1/blogs
async function createBlog(req, res) {
  try {
    const { title, description } = req.body;
    const creator = req.user.id;

    const content = JSON.parse(req.body.content || "{}");
    const tags = JSON.parse(req.body.tags || "[]");

    const image = req.files?.image?.[0]; // blog thumbnail
    const images = req.files?.images || []; // inline content images

    const draft =
      req.body.draft === "false" || req.body.draft === false ? false : true;

    // Input validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "The blog title is required.",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "The blog description is required.",
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required.",
      });
    }

    if (!content || !Array.isArray(content.blocks)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing blog content.",
      });
    }

    // ---------------- Cloudinary Process ----------------------
    let imageIndex = 0;

    // for content images
    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];

      if (block.type === "image") {
        if (images[imageIndex]) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
              "base64"
            )}`
          );

          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };

          imageIndex++;
        } else {
          block.data.file = {
            url: "",
            imageId: "",
          };
        }
      }
    }

    // Upload blog thumbnail image
    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${image.buffer.toString("base64")}`
    );

    // ------------------------------------------------------------------------

    // Validate creator
    const finduser = await User.findById(creator);
    if (!finduser) {
      return res.status(404).json({
        success: false,
        message: "The specified user does not exist.",
      });
    }

    const existing = await Blog.findOne({ title, creator });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You already have a blog with this title.",
      });
    }

    const blogId = title.toLowerCase().split(" ").join("-") + "-" + uuidv4();

    // Create the blog
    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      blogId,
      tags,
      content,
      image: secure_url,
      imageId: public_id,
    });

    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

    return res.status(201).json({
      success: true,
      message: draft
        ? "Blog Saved as Draft. You can publish it from your profile"
        : "Blog created Successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the blog.",
      error: error.message,
    });
  }
}

//  get Blogs
// request :- get
// route :- /api/v1/blogs
async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "name username email",
      })
      .populate({
        path: "likes",
        select: "name email username",
      });

    // // Debug log
    // console.log("Fetched blogs with populated creator:", blogs);

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving blogs.",
      error: error.message,
    });
  }
}

// get Blog
// request :- get
// route :- /api/v1/blogs/:id
async function getBlog(req, res) {
  try {
    const { id } = req.params;
    const blog = await Blog.findOne({ blogId: id })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email username",
        },
      })
      .populate({
        path: "creator",
        select: "name username",
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    console.error("Error in getBlog:", error); // Add this
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//  update Blog
// request :- put
// route :- /api/v1/blogs/:id
async function updateBlog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    const content = JSON.parse(req.body.content || "{}");
    const tags = JSON.parse(req.body.tags || "[]");

    const newImage = req.files?.image?.[0]; // Thumbnail
    const newImages = req.files?.images || []; // Content images

    const draft =
      req.body.draft === "false" || req.body.draft === false ? false : true;

    // Find Blog by ID
    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // console.log("blog.creator:", blog.creator.toString());
    // console.log("req.user:", userId);

    // Authorization Check :- If the user is the creator
    if (blog.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this blog",
      });
    }

    // --------------------- Cloudinary ------------------------
    // Update inline editor images
    let imageIndex = 0;
    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];

      if (block.type === "image") {
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${newImages[imageIndex].buffer.toString(
            "base64"
          )}`
        );

        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };

        imageIndex++;
      }
    }

    // If thumbnail is replaced, delete old one and upload new
    if (newImage) {
      if (blog.imageId) {
        await deleteImagefromCloudinary(blog.imageId);
      }

      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${newImage.buffer.toString("base64")}`
      );

      blog.image = secure_url;
      blog.imageId = public_id;
    }

    // -----------------------------------------------------------------------

    // Update blog fields
    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.content = content || blog.content;
    blog.tags = tags;
    blog.draft = draft;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// delete Blog
// request :- delete
// route :- /api/v1/blogs/:id
async function deleteBlog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find Blog by ID
    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Authorization Check :- If the user is the creator
    if (blog.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog",
      });
    }

    // Delete thumbnail from Cloudinary
    if (blog.imageId) {
      // console.log("Deleting thumbnail:", blog.imageId);
      await deleteImagefromCloudinary(blog.imageId);
    }

    // Delete all content images from Cloudinary
    if (blog.content?.blocks?.length) {
      for (let block of blog.content.blocks) {
        if (block.type === "image" && block.data?.file?.imageId) {
          // console.log("Deleting content image:", block.data.file.imageId);
          await deleteImagefromCloudinary(block.data.file.imageId);
        }
      }
    }

    // Delete the blog
    await Blog.findByIdAndDelete(blog._id);

    // Remove blog from user's blog list
    await User.findByIdAndUpdate(blog.creator, { $pull: { blogs: blog._id } });

    return res.status(200).json({
      success: true,
      message: "Blog Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete blog error: \n", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//  like Blog
// request :- post
// route :- /api/v1/blogs/like/:id
async function likeBlog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find Blog by ID
    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Like/Dislike Logic
    if (!blog.likes.includes(userId)) {
      await Blog.updateOne({ blogId: id }, { $push: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $push: { likeBlogs: blog._id } });

      return res.status(200).json({
        success: true,
        message: "Blog Liked Successfully",
        isLiked: true,
      });
    } else {
      await Blog.updateOne({ blogId: id }, { $pull: { likes: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likeBlogs: blog._id } });

      return res.status(200).json({
        success: true,
        message: "Blog Disliked successfully",
        isLiked: false,
      });
    }
  } catch (error) {
    console.error("Error toggling like on blog: \n", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

//  save Blog
// request :- post
// route :- /api/v1/blogs/save/:id
async function saveBlog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params; // blogId (not _id)

    const blog = await Blog.findOne({ blogId: id });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const user = await User.findById(userId);

    const alreadySaved = blog.totalSaves.includes(userId);

    if (!alreadySaved) {
      await Blog.findByIdAndUpdate(blog._id, { $push: { totalSaves: userId } });
      await User.findByIdAndUpdate(userId, { $push: { saveBlogs: blog._id } });

      return res.status(200).json({
        success: true,
        message: "Blog saved successfully",
        isSaved: true,
      });
    } else {
      await Blog.findByIdAndUpdate(blog._id, { $pull: { totalSaves: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { saveBlogs: blog._id } });

      return res.status(200).json({
        success: true,
        message: "Blog unsaved",
        isSaved: false,
      });
    }
  } catch (error) {
    console.error("Error in saveBlog:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//  search Blogs
async function searchBlogs(req, res) {}

module.exports = {
  createBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  updateBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
};
