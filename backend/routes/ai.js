const express = require('express');
const { summarizeNote } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

router.post('/summarize', summarizeNote);

module.exports = router;
