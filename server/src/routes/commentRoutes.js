const express = require('express');
const router = express.Router();
const { getCommentsByTicket, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCommentsByTicket);
router.post('/', protect, createComment);

module.exports = router;
