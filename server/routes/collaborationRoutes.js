const express = require('express');
const { body } = require('express-validator');
const {
  getIncomingRequests,
  getMyRequests,
  updateCollaborationStatus,
} = require('../controllers/collaborationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Validation rules for updating collaboration status (PATCH)
 */
const updateStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be either accepted or rejected'),
];

// GET /api/collaborations/incoming (Requests for my projects)
router.get('/incoming', protect, getIncomingRequests);

// GET /api/collaborations/mine (Requests submitted by current user)
router.get('/mine', protect, getMyRequests);

// PATCH /api/collaborations/:id (Accept or reject collaboration request)
router.patch('/:id', protect, updateStatusValidation, updateCollaborationStatus);

module.exports = router;
