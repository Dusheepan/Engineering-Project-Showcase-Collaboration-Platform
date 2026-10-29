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

/**
 * Validation rules for creating/updating a project
 */
const projectValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 120 })
    .withMessage('Title must be at most 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
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
