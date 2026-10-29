const Project = require('../models/Project');
const Comment = require('../models/Comment');
const CollaborationRequest = require('../models/CollaborationRequest');
const { validationResult } = require('express-validator');

/**
 * Format express-validator errors into a unified { field, message } array
 * @param {Object} req - Express request
 * @returns {Array|null} Array of formatted error objects or null
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
 * Helper to parse techStack input into a clean array of strings
 * @param {Array|String} input - Array of technologies or comma-separated string
 * @returns {Array<String>}
 */
const formatTechStack = (input) => {
  if (Array.isArray(input)) {
    return input.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Authentication required)
 */
const createProject = async (req, res, next) => {
  try {
    // 1. Validate request body with express-validator
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const {
      title,
      description,
      techStack,
      category,
      githubUrl,
      demoUrl,
      status,
      lookingForCollaborators,
    } = req.body;

    // 2. Format techStack array
    const parsedTechStack = formatTechStack(techStack);
    if (parsedTechStack.length === 0) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            field: 'techStack',
            message: 'Project must include at least one technology in techStack',
          },
        ],
      });
    }

    // 3. Create project with owner set to logged-in user (req.user._id)
    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      techStack: parsedTechStack,
      category,
      githubUrl: (githubUrl || '').trim(),
      demoUrl: (demoUrl || '').trim(),
      status: status || 'Idea',
      lookingForCollaborators: Boolean(lookingForCollaborators),
      owner: req.user._id,
    });

    // 4. Populate owner name and details
    const populatedProject = await project.populate(
      'owner',
      'name email role department'
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects with filtering, searching, sorting, and pagination
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // 1. Case-insensitive search across title, description, or techStack
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { techStack: searchRegex },
      ];
    }

    // 2. Filter by category (Web, Mobile, AI/ML, Embedded, IoT, Other)
    if (category && category !== 'All' && category.trim()) {
      query.category = category.trim();
    }

    // 3. Filter by status (Idea, In Progress, Completed)
    if (status && status !== 'All' && status.trim()) {
      query.status = status.trim();
    }

    // 4. Sorting logic: newest, oldest, title
    const sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      case 'newest':
      default:
        sortOptions.createdAt = -1;
        break;
    }

    // 5. Pagination calculation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // 6. Execute count and query in parallel
    const [total, projects] = await Promise.all([
      Project.countDocuments(query),
      Project.find(query)
        .populate('owner', 'name email role department')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
    ]);

    return res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project details by ID with populated owner name
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner',
      'name email role department'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${req.params.id} not found` }],
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project (Only owner or admin allowed)
 * @route   PUT /api/projects/:id
 * @access  Private (Authentication required)
 */
const updateProject = async (req, res, next) => {
  try {
    // 1. Validate request body with express-validator
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    // 2. Find target project
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${req.params.id} not found` }],
      });
    }

    // 3. Authorization check: only owner or admin can update
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        errors: [
          {
            message:
              'Not authorized to update this project. Only the project owner or an administrator can modify it.',
          },
        ],
      });
    }

    // 4. Prepare update payload
    const updateData = {};
    const allowedFields = [
      'title',
      'description',
      'category',
      'githubUrl',
      'demoUrl',
      'status',
      'lookingForCollaborators',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          typeof req.body[field] === 'string'
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (req.body.techStack !== undefined) {
      const parsedTech = formatTechStack(req.body.techStack);
      if (parsedTech.length === 0) {
        return res.status(400).json({
          success: false,
          errors: [
            {
              field: 'techStack',
              message: 'Project must include at least one technology in techStack',
            },
          ],
        });
      }
      updateData.techStack = parsedTech;
    }

    // 5. Update and return populated document
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate('owner', 'name email role department');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete project (Only owner or admin; also deletes comments and collaboration requests)
 * @route   DELETE /api/projects/:id
 * @access  Private (Authentication required)
 */
const deleteProject = async (req, res, next) => {
  try {
    // 1. Find target project
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${req.params.id} not found` }],
      });
    }

    // 2. Authorization check: only owner or admin can delete
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        errors: [
          {
            message:
              'Not authorized to delete this project. Only the project owner or an administrator can delete it.',
          },
        ],
      });
    }

    // 3. Cascade deletion: delete associated comments and collaboration requests
    await Promise.all([
      Comment.deleteMany({ project: req.params.id }),
      CollaborationRequest.deleteMany({ project: req.params.id }),
      Project.findByIdAndDelete(req.params.id),
    ]);

    return res.status(200).json({
      success: true,
      message:
        'Project and associated comments and collaboration requests deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
