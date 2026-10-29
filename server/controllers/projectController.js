const Project = require('../models/Project');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all projects (with search, category/status filters, and sorting)
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      lookingForCollaborators,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Search filter across title, description, or techStack
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category (enum: Web, Mobile, AI/ML, Embedded, IoT, Other)
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status (enum: Idea, In Progress, Completed)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by lookingForCollaborators flag
    if (lookingForCollaborators !== undefined && lookingForCollaborators !== '') {
      query.lookingForCollaborators = lookingForCollaborators === 'true';
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const projects = await Project.find(query)
      .populate('owner', 'name email role department')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID with owner populated
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
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Public (or Protected)
 */
const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
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
      owner,
    } = req.body;

    // Format techStack into an array of strings
    const formattedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Resolve project owner: use body.owner, req.user._id, or default to the first user
    let projectOwner = owner || req.user?._id;
    if (!projectOwner) {
      const defaultUser = await User.findOne();
      if (defaultUser) {
        projectOwner = defaultUser._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No user exists to assign as project owner. Run seed script first.',
        });
      }
    }

    const project = await Project.create({
      title,
      description,
      techStack: formattedTechStack,
      category: category || 'Other',
      githubUrl: githubUrl || '',
      demoUrl: demoUrl || '',
      status: status || 'Idea',
      lookingForCollaborators: Boolean(lookingForCollaborators),
      owner: projectOwner,
    });

    const populatedProject = await project.populate(
      'owner',
      'name email role department'
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing project
 * @route   PUT /api/projects/:id
 * @access  Public (or Protected)
 */
const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    const updateData = { ...req.body };

    // Format techStack if string provided
    if (typeof updateData.techStack === 'string') {
      updateData.techStack = updateData.techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email role department');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project safely
 * @route   DELETE /api/projects/:id
 * @access  Public (or Protected)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
