const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');
const { getValidationErrors } = require('../middleware/validate');

/**
 * @desc    Submit a collaboration request for a project
 * @route   POST /api/projects/:id/collaborate
 * @access  Private (Authentication required)
 */
const createCollaborationRequest = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const projectId = req.params.id;
    const { message } = req.body;

    // 2. Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        errors: [{ message: `Project with ID ${projectId} not found` }],
      });
    }

    // 3. Business rule: User cannot request to collaborate on their own project
    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            message:
              'You cannot send a collaboration request to your own project.',
          },
        ],
      });
    }

    // 4. Business rule: Prevent duplicate requests from the same user for the same project
    const existingRequest = await CollaborationRequest.findOne({
      project: projectId,
      requester: req.user._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            message: `You have already submitted a collaboration request for this project (current status: ${existingRequest.status}).`,
          },
        ],
      });
    }

    // 5. Create collaboration request
    const collaboration = await CollaborationRequest.create({
      project: projectId,
      requester: req.user._id,
      message: message.trim(),
      status: 'pending',
    });

    // 6. Populate requester and project details
    await collaboration.populate([
      { path: 'requester', select: 'name email department role' },
      { path: 'project', select: 'title category status owner' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Collaboration request submitted successfully',
      data: collaboration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all incoming collaboration requests for projects owned by the logged-in user
 * @route   GET /api/collaborations/incoming
 * @access  Private (Authentication required)
 */
const getIncomingRequests = async (req, res, next) => {
  try {
    // 1. Find all project IDs owned by current user
    const myProjects = await Project.find({ owner: req.user._id }).select('_id');
    const myProjectIds = myProjects.map((p) => p._id);

    // 2. Find collaboration requests targeted to those projects
    const incomingRequests = await CollaborationRequest.find({
      project: { $in: myProjectIds },
    })
      .populate('requester', 'name email department role')
      .populate('project', 'title category status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: incomingRequests.length,
      data: incomingRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all collaboration requests submitted by the logged-in user
 * @route   GET /api/collaborations/mine
 * @access  Private (Authentication required)
 */
const getMyRequests = async (req, res, next) => {
  try {
    // Retrieve requests where requester is logged-in user
    const myRequests = await CollaborationRequest.find({
      requester: req.user._id,
    })
      .populate({
        path: 'project',
        select: 'title category status owner',
        populate: { path: 'owner', select: 'name email department' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: myRequests.length,
      data: myRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept or reject a collaboration request (Project owner or admin only)
 * @route   PATCH /api/collaborations/:id
 * @access  Private (Authentication required)
 */
const updateCollaborationStatus = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validationErrors = getValidationErrors(req);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        errors: validationErrors,
      });
    }

    const { status } = req.body;
    const collaborationId = req.params.id;

    // 2. Find collaboration request with project populated
    const request = await CollaborationRequest.findById(collaborationId).populate(
      'project',
      'title owner status'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        errors: [
          { message: `Collaboration request with ID ${collaborationId} not found` },
        ],
      });
    }

    // 3. Authorization check: only the project owner or an administrator can accept/reject
    const isProjectOwner =
      request.project &&
      request.project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isProjectOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        errors: [
          {
            message:
              'Not authorized. Only the owner of the project or an administrator can accept or reject collaboration requests.',
          },
        ],
      });
    }

    // 4. Update status
    request.status = status;
    await request.save();

    // 5. Populate requester details for response
    await request.populate('requester', 'name email department role');

    return res.status(200).json({
      success: true,
      message: `Collaboration request marked as ${status}`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCollaborationRequest,
  getIncomingRequests,
  getMyRequests,
  updateCollaborationStatus,
};
