const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { v4: uuidv4 } = require("uuid");

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
    const creator = req.user?.id;

    const content = JSON.parse(req.body.content || "{}");
    const tags = JSON.parse(req.body.tags || "[]");
    const image = req.files?.image?.[0]; // blog thumbnail

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

    // Collect already-uploaded inline image URLs from EditorJS blocks
    const uploadedInlineImages = [];
    for (const block of content.blocks) {
      if (block.type === "image" && block.data?.file?.url) {
        uploadedInlineImages.push(block.data.file.url);
      }
    }

    //  Upload blog thumbnail image to Cloudinary
    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${image.buffer.toString("base64")}`
    );

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

    //  Create the blog
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
      images: uploadedInlineImages,
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

// Upload EditorJS inline image
async function uploadEditorImage(req, res) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${file.buffer.toString("base64")}`
    );

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      file: {
        url: secure_url,
        imageId: public_id,
      },
    });
  } catch (error) {
    console.error("Editor image upload failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
}

//  get Blogs
// request :- get
// route :- /api/v1/blogs
async function getBlogs(req, res) {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "name username email",
      })
      .populate({
        path: "likes",
        select: "name email username",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // // Debug log
    // console.log("Fetched blogs with populated creator:", blogs);

    const totalBlogs = await Blog.countDocuments({ draft: false });

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      blogs,
      hasMore: skip + limit < totalBlogs,
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
    console.log("📩 Received blogId param:", id);

    const blog = await Blog.findOne({ blogId: id })
      .select(
        "_id title content image blogId likes comments creator createdAt tags"
      )
      .populate({
        path: "creator",
        select: "name username email followers profilePic",
      })
      .populate({
        path: "comments",
        match: { parentComment: null },
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: "user",
            select: "name username email profilePic",
          },
          {
            path: "replies",
            options: { sort: { createdAt: 1 } },
            populate: {
              path: "user",
              select: "name username email profilePic",
            },
          },
        ],
      })
      .lean();
    console.log("🔍 Blog result:", blog);

    console.log("📥 Blog.likes = ", blog.likes);

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
    console.error("Error in getBlog:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// get Users Blog
// request :- get
// route :- /api/v1/blogs/user
const getUserBlogs = async (req, res) => {
  try {
    const { draft } = req.query;

    const filter = { creator: req.user._id };
    if (draft !== undefined) {
      filter.draft = draft === "true"; // convert query string to boolean
    }

    const blogs = await Blog.find(filter).populate(
      "creator",
      "name username email"
    );

    if (!blogs.length) {
      return res.status(404).json({
        success: false,
        message: "You don't have any blogs",
      });
    }

    return res.status(200).json({
      success: true,
      blogs,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//  update Blog
// request :- put
// route :- /api/v1/blogs/:id
async function updateBlog(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description } = req.body;

    const content =
      typeof req.body.content === "string"
        ? JSON.parse(req.body.content)
        : req.body.content;

    const tags =
      typeof req.body.tags === "string"
        ? JSON.parse(req.body.tags)
        : req.body.tags;

    const newImage = req.files?.image?.[0]; // Thumbnail
    const newImages = req.files?.images || []; // Content images

    const draft =
      req.body.draft === "false" || req.body.draft === false ? false : true;

    // Find Blog by ID
    const blog = await Blog.findOne({ blogId: req.params.id });

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
        const file = newImages[imageIndex];

        if (file) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${file.buffer.toString("base64")}`
          );

          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };

          imageIndex++;
        }
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
    const { id: blogId } = req.params;

    const blog = await Blog.findOne({ blogId });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const alreadyLiked = blog.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedBlog = await Blog.findOneAndUpdate({ blogId }, update, {
      new: true,
      select: "likes",
    });

    const userUpdate = alreadyLiked ? "$pull" : "$addToSet";
    await User.findByIdAndUpdate(userId, {
      [userUpdate]: { likeBlogs: blog._id },
    });

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Blog un‑liked" : "Blog liked",
      isLiked: !alreadyLiked,
      likesCount: updatedBlog.likes.length,
      likes: updatedBlog.likes,
    });
  } catch (err) {
    console.error("likeBlog error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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
  uploadEditorImage,
  deleteBlog,
  getBlog,
  getBlogs,
  getUserBlogs,
  updateBlog,
  likeBlog,
  saveBlog,
  searchBlogs,
};
