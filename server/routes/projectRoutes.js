const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const router = express.Router();

const ALLOWED_CATEGORIES = [
  'Web',
  'Mobile',
  'AI/ML',
  'Embedded',
  'IoT',
  'Other',
];

const ALLOWED_STATUSES = ['Idea', 'In Progress', 'Completed'];

/**
 * Validation rules for creating or updating an engineering project
 */
const projectValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters long'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters long'),

  body('category')
    .optional()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(
      `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    ),

  body('status')
    .optional()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Demo URL must be a valid URL'),
];

// Routes for /api/projects
router
  .route('/')
  .get(getProjects)
  .post(projectValidationRules, createProject);

// Routes for /api/projects/:id
router
  .route('/:id')
  .get(getProjectById)
  .put(projectValidationRules, updateProject)
  .delete(deleteProject);

module.exports = router;
