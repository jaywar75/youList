const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User'); // Ensure this path is correct
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating reset tokens
const nodemailer = require('nodemailer'); // For sending reset emails

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

// GET /forgot-password - Render the forgot password form
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { bodyClass: 'auth-page' });
});

// POST /forgot-password - Handle forgot password form submission
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('forgot-password', { error: 'No account found with that email.' });
        }

        // Generate a reset token and set its expiration time
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        // Send the password reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Replace with your email provider
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password or app-specific password
            },
        });

        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested to reset the password for your account.\n\n
            Please click on the following link, or paste it into your browser to complete the process:\n\n
            ${resetUrl}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        req.flash('success_msg', 'An email has been sent to ' + user.email + ' with further instructions.');
        res.redirect('/login');
    } catch (err) {
        console.error('Error sending reset email:', err);
        res.render('forgot-password', { error: 'An error occurred while sending the reset email. Please try again.' });
    }
});

// GET /reset-password/:token - Render the reset password form
router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        // Render the reset password form, passing the token
        res.render('reset-password', { token: req.params.token, bodyClass: 'auth-page' });
    } catch (err) {
        console.error('Error retrieving user for reset:', err);
        res.redirect('/forgot-password');
    }
});

// POST /reset-password/:token - Handle reset password form submission
router.post('/reset-password/:token', async (req, res) => {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('reset-password', { error: 'Passwords do not match.', token: req.params.token });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        // Hash the new password and save it
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Your password has been successfully reset. You can now log in.');
        res.redirect('/login');
    } catch (err) {
        console.error('Error resetting password:', err);
        res.render('reset-password', { error: 'An error occurred while resetting the password. Please try again.', token: req.params.token });
    }
});

module.exports = router;
