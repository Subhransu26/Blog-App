const cloudinary = require("cloudinary").v2;

async function uploadImage(imagePath) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "blog app",
    });
    return result;
  } catch (error) {
    // console.log(error);
    throw error;
  }
}

async function deleteImagefromCloudinary(imageId) {
  try {
    const result = await cloudinary.uploader.destroy(imageId);
    return result;
  } catch (error) {
    // console.log(error);
    throw error;
  }
}

module.exports = { uploadImage, deleteImagefromCloudinary };
