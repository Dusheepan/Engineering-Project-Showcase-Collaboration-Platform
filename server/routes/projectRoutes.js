const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const {
  createComment,
  getProjectComments,
} = require('../controllers/commentController');
const {
  createCollaborationRequest,
} = require('../controllers/collaborationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const VALID_CATEGORIES = [
  'Web',
  'Mobile',
  'AI/ML',
  'Embedded',
  'IoT',
  'Other',
];

const VALID_STATUSES = ['Idea', 'In Progress', 'Completed'];

/**
 * Validation rules for project creation (POST)
 */
const createProjectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters long'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(VALID_CATEGORIES)
    .withMessage(
      `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
    ),

  body('techStack')
    .custom((val) => {
      if (Array.isArray(val) && val.length > 0) return true;
      if (typeof val === 'string' && val.trim().length > 0) return true;
      throw new Error('Project must specify at least one technology in techStack');
    }),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Demo URL must be a valid URL'),

  body('lookingForCollaborators')
    .optional()
    .isBoolean()
    .withMessage('lookingForCollaborators must be a boolean value'),
];

/**
 * Validation rules for project update (PUT)
 */
const updateProjectValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters long'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(
      `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
    ),

  body('techStack')
    .optional()
    .custom((val) => {
      if (Array.isArray(val) && val.length > 0) return true;
      if (typeof val === 'string' && val.trim().length > 0) return true;
      throw new Error('Project must specify at least one technology in techStack');
    }),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Demo URL must be a valid URL'),

  body('lookingForCollaborators')
    .optional()
    .isBoolean()
    .withMessage('lookingForCollaborators must be a boolean value'),
];

/**
 * Validation rules for posting a comment
 */
const commentValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment text must be between 1 and 1000 characters long'),
];

/**
 * Validation rules for submitting a collaboration request
 */
const collaborationValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Collaboration request message is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Collaboration message must be between 5 and 500 characters long'),
];

// Routes for /api/projects
router
  .route('/')
  .get(getProjects)
  .post(protect, createProjectValidation, createProject);

// Routes for /api/projects/:id
router
  .route('/:id')
  .get(getProjectById)
  .put(protect, updateProjectValidation, updateProject)
  .delete(protect, deleteProject);

// Nested routes for Comments on a Project:
// POST /api/projects/:id/comments
// GET /api/projects/:id/comments
router
  .route('/:id/comments')
  .get(getProjectComments)
  .post(protect, commentValidation, createComment);

// Nested route for Collaboration Request:
// POST /api/projects/:id/collaborate
router
  .route('/:id/collaborate')
  .post(protect, collaborationValidation, createCollaborationRequest);

module.exports = router;
