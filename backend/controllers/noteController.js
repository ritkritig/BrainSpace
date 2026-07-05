const { validationResult } = require('express-validator');
const Note = require('../models/Note');

/**
 * Helper: build a search query from URL params
 */
const buildQuery = (userId, params) => {
  const { search, folder, tags, isPinned, isArchived } = params;

  const query = { owner: userId };

  // Default: show non-archived notes (can be overridden)
  query.isArchived = isArchived === 'true';

  if (isPinned === 'true') query.isPinned = true;
  if (folder) query.folder = folder === 'none' ? null : folder;

  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagArray.length) query.tags = { $in: tagArray };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];
  }

  return query;
};

/**
 * @desc    Get all notes for the current user (with filtering & search)
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    const query = buildQuery(req.user._id, req.query);

    const notes = await Note.find(query)
      .populate('folder', 'name color icon')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({ success: true, count: notes.length, notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notes.' });
  }
};

/**
 * @desc    Get a single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id }).populate(
      'folder',
      'name color icon'
    );
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching note.' });
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { title, content, folder, tags } = req.body;

  try {
    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '',
      folder: folder || null,
      owner: req.user._id,
      tags: tags || [],
    });

    const populated = await note.populate('folder', 'name color icon');

    res.status(201).json({ success: true, message: 'Note created.', note: populated });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ success: false, message: 'Server error creating note.' });
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const { title, content, folder, tags } = req.body;

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (folder !== undefined) note.folder = folder || null;
    if (tags !== undefined) note.tags = tags;

    await note.save();
    const populated = await note.populate('folder', 'name color icon');

    res.status(200).json({ success: true, message: 'Note updated.', note: populated });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Server error updating note.' });
  }
};

/**
 * @desc    Delete a note permanently
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.status(200).json({ success: true, message: 'Note deleted permanently.' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting note.' });
  }
};

/**
 * @desc    Toggle archive status of a note
 * @route   POST /api/notes/:id/archive
 * @access  Private
 */
const toggleArchive = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    note.isArchived = !note.isArchived;
    // Archived notes are automatically un-pinned
    if (note.isArchived) note.isPinned = false;

    await note.save();

    res.status(200).json({
      success: true,
      message: note.isArchived ? 'Note archived.' : 'Note restored from archive.',
      note,
    });
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({ success: false, message: 'Server error archiving note.' });
  }
};

/**
 * @desc    Toggle pin status of a note
 * @route   POST /api/notes/:id/pin
 * @access  Private
 */
const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    // Cannot pin archived notes
    if (note.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Cannot pin an archived note. Restore it first.',
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: note.isPinned ? 'Note pinned.' : 'Note unpinned.',
      note,
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ success: false, message: 'Server error pinning note.' });
  }
};

/**
 * @desc    Duplicate a note
 * @route   POST /api/notes/:id/duplicate
 * @access  Private
 */
const duplicateNote = async (req, res) => {
  try {
    const original = await Note.findOne({ _id: req.params.id, owner: req.user._id });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const duplicate = await Note.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      folder: original.folder,
      owner: req.user._id,
      tags: [...original.tags],
      isPinned: false,
      isArchived: false,
    });

    const populated = await duplicate.populate('folder', 'name color icon');

    res.status(201).json({ success: true, message: 'Note duplicated.', note: populated });
  } catch (error) {
    console.error('Duplicate note error:', error);
    res.status(500).json({ success: false, message: 'Server error duplicating note.' });
  }
};

/**
 * @desc    Get dashboard stats for the current user
 * @route   GET /api/notes/stats
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const [totalNotes, pinnedNotes, archivedNotes, recentNotes] = await Promise.all([
      Note.countDocuments({ owner: ownerId, isArchived: false }),
      Note.countDocuments({ owner: ownerId, isPinned: true, isArchived: false }),
      Note.countDocuments({ owner: ownerId, isArchived: true }),
      Note.find({ owner: ownerId, isArchived: false })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('folder', 'name color'),
    ]);

    res.status(200).json({
      success: true,
      stats: { totalNotes, pinnedNotes, archivedNotes },
      recentNotes,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleArchive,
  togglePin,
  duplicateNote,
  getStats,
};
