const { validationResult } = require('express-validator');
const Folder = require('../models/Folder');
const Note = require('../models/Note');

/**
 * @desc    Get all folders belonging to the logged-in user
 * @route   GET /api/folders
 * @access  Private
 */
const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Attach note count per folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const count = await Note.countDocuments({ folder: folder._id, isArchived: false });
        return { ...folder.toObject(), noteCount: count };
      })
    );

    res.status(200).json({ success: true, folders: foldersWithCount });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching folders.' });
  }
};

/**
 * @desc    Create a new folder
 * @route   POST /api/folders
 * @access  Private
 */
const createFolder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, color, icon } = req.body;

  try {
    const folder = await Folder.create({
      name,
      color: color || '#3B82F6',
      icon: icon || 'folder',
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Folder created.',
      folder: { ...folder.toObject(), noteCount: 0 },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A folder with this name already exists.',
      });
    }
    console.error('Create folder error:', error);
    res.status(500).json({ success: false, message: 'Server error creating folder.' });
  }
};

/**
 * @desc    Rename / update a folder
 * @route   PUT /api/folders/:id
 * @access  Private
 */
const updateFolder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    const { name, color, icon } = req.body;
    if (name) folder.name = name;
    if (color) folder.color = color;
    if (icon) folder.icon = icon;

    await folder.save();

    res.status(200).json({ success: true, message: 'Folder updated.', folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A folder with this name already exists.',
      });
    }
    console.error('Update folder error:', error);
    res.status(500).json({ success: false, message: 'Server error updating folder.' });
  }
};

/**
 * @desc    Delete a folder and un-assign its notes (notes are preserved)
 * @route   DELETE /api/folders/:id
 * @access  Private
 */
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    // Un-assign notes from this folder instead of deleting them
    await Note.updateMany({ folder: folder._id }, { $set: { folder: null } });

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Folder deleted. Notes have been moved to Uncategorized.',
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting folder.' });
  }
};

module.exports = { getFolders, createFolder, updateFolder, deleteFolder };
