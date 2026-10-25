const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  uploadSingleImage,
  uploadMultipleImages,
  uploadAvatar,
  deleteImage,
  getStatus
} = require('../controllers/uploadController');

// Status check (open)
router.get('/status', getStatus);

// Authenticated upload endpoints
router.post('/image', protect, upload.single('image'), uploadSingleImage);
router.post('/images', protect, upload.array('images', 10), uploadMultipleImages);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
