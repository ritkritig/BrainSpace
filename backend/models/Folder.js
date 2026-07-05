const mongoose = require('mongoose');

/**
 * Folder schema – organizes notes by category.
 * Each folder belongs to a single user (owner).
 */
const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      minlength: [1, 'Folder name cannot be empty'],
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: '#3B82F6', // Default blue accent
    },
    icon: {
      type: String,
      default: 'folder',
    },
  },
  { timestamps: true }
);

// Compound index: a user cannot have two folders with the same name
folderSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
