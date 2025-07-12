const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const { generateJWT, verifyJWT } = require("../utils/generateToken");
const transporter = require("../utils/transporter");
const { EMAIL_USER, FRONTEND_URL } = require("../config/dotenv.config");


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

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.googleAuth) {
        return res.status(400).json({
          success: true,
          message:
            "This email already registered with google. please try through continue with google",
        });
      }
      if (existingUser.isVerify) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered and verified. Please log in.",
        });
      } else {
        // Resend verification email
        const verificationToken = generateJWT({
          id: existingUser._id,
          email: existingUser.email,
        });

        const verificationLink = `${FRONTEND_URL}/verify-email/${verificationToken}`;

        await transporter.sendMail({
          from: `"BlogApp Support" <${EMAIL_USER}>`,
          to: email,
          subject: "Verify Your Email Address - BlogApp",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f7; color: #333;">
              <h2 style="color: #4f46e5;">Welcome Back to BlogApp!</h2>
              <p>Your email is already registered but not yet verified.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 24px; margin-top: 16px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px;">
                Verify Email
              </a>
              <p style="margin-top: 24px;">If you didn’t request this, you can ignore it.</p>
              <p>— The BlogApp Team</p>
            </div>
          `,
        });

        return res.status(200).json({
          success: true,
          message:
            "Email already registered but not verified. Please check your inbox.",
        });
      }
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please choose another.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    const verificationToken = generateJWT({
      id: newUser._id,
      email: newUser.email,
    });

    const verificationLink = `${FRONTEND_URL}/verify-email/${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
      from: `"BlogApp Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address - BlogApp",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f7; color: #333;">
          <h2 style="color: #4f46e5;">Welcome to BlogApp!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 24px; margin-top: 16px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
          <p style="margin-top: 24px;">If you didn’t request this, you can safely ignore this email.</p>
          <p>— The BlogApp Team</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Account created! Please verify your email to continue.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
}

// Verify Email
// Method: GET
// Route: /api/v1/verify-email/:verificationToken
async function verifyEmail(req, res) {
  try {
    const { verificationToken } = req.params;

    const decoded = verifyJWT(verificationToken);

    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const { id } = decoded;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.isVerify) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    user.isVerify = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed, please try again",
      error: error.message,
    });
  }
}

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

    // Check if user exists
    const checkUser = await User.findOne({ email }).select("+password");

    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Check if email is verified
    if (!checkUser.isVerify) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate token
    const token = await generateJWT({
      email: checkUser.email,
      id: checkUser._id,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: checkUser._id,
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
  followUser,
  changeSavedLikedBlog,
};
