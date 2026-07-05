const mongoose = require('mongoose');

/**
 * Note schema – the core entity of BrainSpace.
 * Supports rich text content, tags, pinning, and archiving.
 */
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'Untitled Note',
    },
    content: {
      type: String, // Stored as HTML from TipTap editor
      default: '',
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: 'A note cannot have more than 10 tags',
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    // Store last AI summary so it can be shown without re-fetching
    aiSummary: {
      summary: { type: String, default: '' },
      keyPoints: { type: [String], default: [] },
      generatedAt: { type: Date },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt managed by Mongoose
  }
);

// Text index for full-text search across title, content, and tags
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Standard indexes for common query patterns
noteSchema.index({ owner: 1, isArchived: 1, createdAt: -1 });
noteSchema.index({ owner: 1, isPinned: 1 });
noteSchema.index({ owner: 1, folder: 1 });

module.exports = mongoose.model('Note', noteSchema);
