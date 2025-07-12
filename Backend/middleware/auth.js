const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Please sign in",
      });
    }

    try {
      const user = await verifyJWT(token);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Please sign in",
        });
      }

      req.user = {
        _id: user.id,
        email: user.email,
      };

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Token missing",
    });
  }
};

module.exports = verifyUser;
