const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in session
        if (req.session && req.session.token) {
            token = req.session.token;
        }

        if (!token) {
            return res.status(401).redirect('/login');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).redirect('/login');
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).redirect('/login');
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('Access denied');
        }
        next();
    };
};