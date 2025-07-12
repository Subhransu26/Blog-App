const mongoose = require("mongoose");
const { DB_URL } = require("./dotenv.config");

async function dbConnect() {
  try {
    await mongoose.connect(DB_URL);
    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB connection failed:", error.message);
    throw error;
  }
}

module.exports = dbConnect;
