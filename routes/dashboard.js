const express = require('express');
const router = express.Router();

// GET /dashboard - Render the main dashboard
router.get('/', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

module.exports = router;
