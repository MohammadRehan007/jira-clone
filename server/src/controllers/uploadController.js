const { uploadStream, deleteResource, isCloudinaryConfigured } = require('../config/cloudinary');
const User = require('../models/User');

/**
 * Upload a single image
 * POST /api/upload/image
 */
const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please select an image file to upload');
    }

    const folder = req.body.folder || 'jira-clone/attachments';
    const uploadResult = await uploadStream(req.file.buffer, {
      folder,
      resource_type: 'image'
    });

    res.status(200).json({
      success: true,
      file: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        name: req.file.originalname,
        size: uploadResult.bytes,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('Please select at least one image file to upload');
    }

    const folder = req.body.folder || 'jira-clone/attachments';
    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadStream(file.buffer, {
        folder,
        resource_type: 'image'
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        name: file.originalname,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload & update current user profile avatar
 * POST /api/upload/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please select an avatar image to upload');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Upload with face-crop transformation
    const result = await uploadStream(req.file.buffer, {
      folder: 'jira-clone/avatars',
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' }
      ]
    });

    // Delete previous avatar from Cloudinary if existed
    if (user.avatarPublicId) {
      try {
        await deleteResource(user.avatarPublicId);
      } catch (err) {
        console.warn('[Cloudinary] Could not delete old avatar:', err.message);
      }
    }

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an image by its publicId
 * DELETE /api/upload/:publicId
 */
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      res.status(400);
      throw new Error('Cloudinary publicId is required');
    }

    // decode if passed URI encoded
    const decodedPublicId = decodeURIComponent(publicId);
    const result = await deleteResource(decodedPublicId);

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cloudinary status check
 * GET /api/upload/status
 */
const getStatus = async (req, res) => {
  res.json({
    configured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null
  });
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadAvatar,
  deleteImage,
  getStatus
};
