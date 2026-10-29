const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// DELETE /api/comments/:id (Only comment author or admin)
router.delete('/:id', protect, deleteComment);

module.exports = router;
