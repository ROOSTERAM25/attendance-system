const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, department, division } = req.body;

        console.log('Registration attempt:', { name, email, role, department, division });

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        console.log('User not found, creating new user...');

        // Create user
        const user = new User({
            name,
            email,
            password,
            role,
            rollNumber: role === 'student' ? rollNumber : undefined,
            department,
            division: role === 'student' ? division : undefined
        });

        console.log('User object created, saving to DB...');
        await user.save();

        console.log('User created successfully:', user._id);

        const token = generateToken(user._id);
        req.session.token = token;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            role: user.role
        });
    } catch (error) {
        console.error('Register error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed: ' + error.message 
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const token = generateToken(user._id);
        req.session.token = token;

        res.json({
            success: true,
            message: 'Login successful',
            role: user.role
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed: ' + error.message 
        });
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: 'Logout failed' 
            });
        }
        res.redirect('/login');
    });
};