const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Check if Cloudinary is configured
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  );
};

/**
 * Upload a Buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer
 * @param {Object} options - Cloudinary upload options (folder, transformation, etc.)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env'
        )
      );
    }

    const defaultOptions = {
      folder: 'jira-clone',
      resource_type: 'auto',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.end(buffer);
  });
};

/**
 * Delete a resource from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const deleteResource = async (publicId, options = {}) => {
  if (!isCloudinaryConfigured() || !publicId) {
    return { result: 'skipped' };
  }
  return await cloudinary.uploader.destroy(publicId, options);
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadStream,
  deleteResource
};
