const mongoose = require('mongoose');

/**
 * Project Schema
 * Represents engineering showcase projects
 */
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Title must be between 3 and 100 characters long'],
      maxlength: [100, 'Title must be between 3 and 100 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters long'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    techStack: {
      type: [String],
      required: [true, 'Tech stack is required'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Project must include at least one technology in techStack',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Web', 'Mobile', 'AI/ML', 'Embedded', 'IoT', 'Other'],
        message:
          '{VALUE} is not a valid category (allowed: Web, Mobile, AI/ML, Embedded, IoT, Other)',
      },
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
      maxlength: [255, 'GitHub URL cannot exceed 255 characters'],
    },
    demoUrl: {
      type: String,
      trim: true,
      default: '',
      maxlength: [255, 'Demo URL cannot exceed 255 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Idea', 'In Progress', 'Completed'],
        message:
          '{VALUE} is not a valid status (allowed: Idea, In Progress, Completed)',
      },
      default: 'Idea',
    },
    lookingForCollaborators: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on Project.title and Project.category
ProjectSchema.index({ title: 1 });
ProjectSchema.index({ category: 1 });

// Composite / text index for full-text searching across title, description, and techStack
ProjectSchema.index({ title: 'text', description: 'text', techStack: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
