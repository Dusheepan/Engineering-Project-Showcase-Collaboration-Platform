const mongoose = require('mongoose');

/**
 * Comment Schema
 * Represents peer reviews and discussions on engineering projects
 */
const CommentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment text cannot be empty'],
      maxlength: [1000, 'Comment text cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch comments for a specific project sorted by createdAt
CommentSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
