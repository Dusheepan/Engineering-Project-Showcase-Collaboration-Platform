const mongoose = require('mongoose');

/**
 * Engineering Project Schema
 * Represents student engineering projects displayed in the showcase
 */
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Engineering department is required'],
      enum: [
        'Computer Engineering',
        'Electrical & Electronic Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Mechatronics Engineering',
        'Chemical Engineering',
        'Other',
      ],
      default: 'Computer Engineering',
    },
    technologies: {
      type: [String],
      required: [true, 'At least one technology must be specified'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Project must include at least one technology/tool',
      },
    },
    teamMembers: {
      type: [String],
      default: [],
    },
    supervisor: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    liveDemoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'Under Review'],
      default: 'In Progress',
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality on title, description, and technologies
ProjectSchema.index({ title: 'text', description: 'text', department: 'text' });

module.exports = mongoose.model('Project', ProjectSchema);
