const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/dotenv.config");
require("dotenv").config();

function generateJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}


function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function decodeJWT(token) {
  return jwt.decode(token);
}

module.exports = {
  generateJWT,
  verifyJWT,
  decodeJWT,
};
