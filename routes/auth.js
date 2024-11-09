const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User'); // Ensure this path is correct
const bcrypt = require('bcrypt');

// GET /register - Render the registration form
router.get('/register', (req, res) => {
    res.render('register', { bodyClass: 'auth-page' });
});

// POST /register - Handle registration form submission
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('register', { error: 'Please provide both username and password.' });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists. Please choose another one.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Redirect to login page after successful registration
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
        res.render('register', { error: 'An error occurred during registration. Please try again.' });
    }
});

// GET /login - Render the login form
router.get('/login', (req, res) => {
    res.render('login', { bodyClass: 'auth-page' });
});

// POST /login - Handle login form submission
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })
);

// Export the router
module.exports = router;
