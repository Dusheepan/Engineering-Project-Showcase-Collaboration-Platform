const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

/**
 * Format express-validator errors into a unified { field, message } array
 */
const getValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
  }
  return null;
};

/**
 * @desc    Create a comment on a project
 * @route   POST /api/projects/:id/comments
 * @access  Private (Authentication required)
 */
const createComment = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const { text } = req.body;
    const projectId = req.params.id;

    // 2. Check target project existence
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${projectId} not found` }],
      });
    }

    // 3. Create comment linked to project and author (logged-in user)
    const comment = await Comment.create({
      project: projectId,
      author: req.user._id,
      text: text.trim(),
    });

    // 4. Populate author details
    await comment.populate('author', 'name email department role');

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a project
 * @route   GET /api/projects/:id/comments
 * @access  Public
 */
const getProjectComments = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // 1. Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${projectId} not found` }],
      });
    }

    // 2. Retrieve comments sorted by newest first with author populated
    const comments = await Comment.find({ project: projectId })
      .populate('author', 'name email department role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment (Only comment author or admin)
 * @route   DELETE /api/comments/:id
 * @access  Private (Authentication required)
 */
const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;

    // 1. Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Comment with ID ${commentId} not found` }],
      });
    }

    // 2. Check authorization: author or admin only
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        errors: [
          {
            message:
              'Not authorized to delete this comment. Only the comment author or an administrator can remove it.',
          },
        ],
      });
    }

    // 3. Delete comment document
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: { id: commentId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getProjectComments,
  deleteComment,
};
