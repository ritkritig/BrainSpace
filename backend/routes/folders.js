const express = require('express');
const { body } = require('express-validator');
const {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const folderValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Folder name must be 1-100 characters'),
];

// All folder routes require authentication
router.use(protect);

router.get('/', getFolders);
router.post('/', folderValidation, createFolder);
router.put('/:id', folderValidation, updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;
