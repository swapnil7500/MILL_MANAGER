const express = require('express');
const router = express.Router();
const {
  createEntry,
  getEntries,
  updateEntry,
  updateStatus,
  addComment,
  deleteEntry,
  getMyEntries,
} = require('../controllers/entryController');
const { verifyToken } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.use(verifyToken); // everything below needs a login

// Customer route (must stay above '/:id' routes)
router.get('/mine', getMyEntries);

// Admin routes
router.post('/', adminOnly, createEntry);
router.get('/', adminOnly, getEntries);
router.put('/:id', adminOnly, updateEntry);
router.patch('/:id/status', adminOnly, updateStatus);
router.post('/:id/comment', adminOnly, addComment);
router.delete('/:id', adminOnly, deleteEntry);

module.exports = router;