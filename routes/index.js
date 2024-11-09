// routes/index.js

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Ensure this path is correct

// Use the middleware in your routes
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const activeTasks = await Task.find({ user: req.user._id, status: 'Active' }) || [];
    const completedTasks = await Task.find({ user: req.user._id, status: 'Completed' }) || [];

    res.render('index', {
      title: 'Dashboard',
      username: req.user.firstName || req.user.username,
      activeTasks,
      completedTasks,
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.render('error', {
      message: 'An error occurred while fetching tasks.',
      error: err,
    });
  }
});

module.exports = router;
