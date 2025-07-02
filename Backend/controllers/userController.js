const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const { generateJWT } = require("../utils/generateToken");

// Create User
// request :- post
// route :- /api/v1/signup
async function createUser(req, res) {
  const { name, email, username, password } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please enter the name",
      });
    }
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Please enter the username",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the password",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter the email",
      });
    }

    // Check for existing user
    const checkForExistingUser = await User.findOne({ email });
    if (checkForExistingUser) {
      return res.status(400).json({
        message:
          "This email is already registered. Try logging in or use Google Sign-In.",
        success: false,
      });
    }

    // Check for existing Username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already taken. Please choose another.",
        success: false,
      });
    }

    // Hash password
    const HashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      username,
      password: HashPassword,
    });

    await newUser.save();

    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    return res.status(200).json({
      message: "User Created Successfully",
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Verify Email
async function verifyEmail(req, res) {}

// Google Authentication
async function googleAuth(req, res) {}

// Login
// request :- post
// route :- /api/v1/login
async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter the password",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter the email",
      });
    }

    // check if user exist
    const checkUser = await User.findOne({ email }).select("+password");
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "No User found with this email",
      });
    }

    // Compare Hash password
    const isPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    let token = await generateJWT({
      email: checkUser.email,
      id: checkUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: checkUser._id,
        name: checkUser.name,
        email: checkUser.email,
        profilePic: checkUser.profilePic,
        username: checkUser.username,
        bio: checkUser.bio,
        showLikedBlogs: checkUser.showLikedBlogs,
        showSavedBlogs: checkUser.showSavedBlogs,
        followers: checkUser.followers,
        following: checkUser.following,
      },
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Get All Users
// request :- get
// route :- /api/v1/users
async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "please try again",
      error: error.message,
    });
  }
}

// Get User By Id
// request :- get
// route :- /api/v1/users/:username
async function getUserById(req, res) {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "please try again later",
      error: error.message,
    });
  }
}

// Update User
// request :- put
// route :- /api/v1/users/:id
async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const { name } = req.body;

    // Authorization check
    if (req.user !== id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access. You can update only your profile.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Delete User
// request: DELETE
// route: /api/v1/users/:id
async function deleteUser(req, res) {
  try {
    const id = req.params._id;

    // Authorization check
    if (req.user !== id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this user",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deleteUser) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: {
        id: deletedUser._id,
        email: deletedUser.email,
        username: deletedUser.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Follow User
async function followUser(req, res) {}

// Change Saved Liked Blog
async function changeSavedLikedBlog(req, res) {}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  verifyEmail,
  googleAuth,
  followUser,
  changeSavedLikedBlog,
};
