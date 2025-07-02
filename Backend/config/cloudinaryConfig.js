const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("./dotenv.config");

const cloudinary = require("cloudinary").v2;

async function cloudinaryConfig() {
  try {
    await cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    console.log("✅ Cloudinary configured successfully");
  } catch (error) {
    console.error("❌ Error during Cloudinary configuration:", error);
  }
}

module.exports = cloudinaryConfig;
