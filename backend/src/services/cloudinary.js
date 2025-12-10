const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(imageData, folder = 'departments') {
  if (!imageData) return null;
  const res = await cloudinary.uploader.upload(imageData, {
    folder,
  });
  return res;
}

async function deleteImage(publicId) {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
}

module.exports = {
  uploadImage,
  deleteImage,
};
