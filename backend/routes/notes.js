const express = require('express');
const { body } = require('express-validator');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleArchive,
  togglePin,
  duplicateNote,
  getStats,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const noteValidation = [
  body('title').optional().isLength({ max: 200 }).withMessage('Title too long'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
];

// All note routes require authentication
router.use(protect);

router.get('/stats', getStats);          // Must be before /:id
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', noteValidation, createNote);
router.put('/:id', noteValidation, updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/archive', toggleArchive);
router.post('/:id/pin', togglePin);
router.post('/:id/duplicate', duplicateNote);

module.exports = router;
