const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or malformed",
      });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyJWT(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please sign in again",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error: ", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = verifyUser;
