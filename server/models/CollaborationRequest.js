const mongoose = require('mongoose');

/**
 * CollaborationRequest Schema
 * Represents requests from students seeking to join or collaborate on an engineering project
 */
const CollaborationRequestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester reference is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Collaboration request message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters long'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected'],
        message:
          '{VALUE} is not a valid status (allowed: pending, accepted, rejected)',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending requests from the same user for the same project
CollaborationRequestSchema.index(
  { project: 1, requester: 1 },
  { unique: false }
);

module.exports = mongoose.model(
  'CollaborationRequest',
  CollaborationRequestSchema
);
