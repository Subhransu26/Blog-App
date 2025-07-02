const express = require("express");

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  login,
  googleAuth,
  verifyEmail,
  followUser,
  changeSavedLikedBlog,
} = require("../controllers/userController");
const verifyUser = require("../middleware/auth");

const route = express.Router();

route.post("/signup", createUser);
route.post("/login", login);

route.get("/users", getAllUsers);
route.get("/users/:username", getUserById);

route.put("/users/:id", verifyUser, updateUser)

route.delete("/users/:id", verifyUser, deleteUser);


module.exports = route;
