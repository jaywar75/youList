// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

function ensureAuthenticated(req, res, next) {
    // Get the token from the request headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.redirect('/login');
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.redirect('/login');
        }
        req.user = user;
        next();
    });

    // middleware/authMiddleware.js

    {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }
}

module.exports = { ensureAuthenticated };
