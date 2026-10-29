const Project = require('../models/Project');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all projects (with search, filter, and sorting)
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const { search, department, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Search filter across title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by project status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sort order
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const projects = await Project.find(query).sort(sortOptions);

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
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

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
    // Validate request using express-validator
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
      department,
      technologies,
      teamMembers,
      supervisor,
      githubUrl,
      liveDemoUrl,
      status,
      year,
    } = req.body;

    // Ensure technologies is array
    const formattedTechnologies = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
      ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Ensure teamMembers is array
    const formattedTeamMembers = Array.isArray(teamMembers)
      ? teamMembers
      : typeof teamMembers === 'string'
      ? teamMembers.split(',').map((m) => m.trim()).filter(Boolean)
      : [];

    const project = await Project.create({
      title,
      description,
      department,
      technologies: formattedTechnologies,
      teamMembers: formattedTeamMembers,
      supervisor,
      githubUrl,
      liveDemoUrl,
      status,
      year: year || new Date().getFullYear(),
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
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

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project with ID ${req.params.id} not found`,
      });
    }

    // Process technologies and team members if strings are provided
    const updateData = { ...req.body };
    if (typeof updateData.technologies === 'string') {
      updateData.technologies = updateData.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (typeof updateData.teamMembers === 'string') {
      updateData.teamMembers = updateData.teamMembers
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
    }

    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
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
