require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with MongoDB store
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db'
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    }
};

app.use(session(sessionConfig));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.token) {
        // Redirect based on user role (you'll need to decode token)
        return res.redirect('/student/dashboard');
    }
    res.render('login');
});

app.get('/register', (req, res) => {
    if (req.session.token) {
        return res.redirect('/student/dashboard');
    }
    res.render('register');
});

// API Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/teacher', require('./routes/teacherRoutes'));
app.use('/student', require('./routes/studentRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 3000;
const os = require('os');

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const preferredPatterns = ['Wi-Fi', 'Ethernet', 'wlan'];
    
    // Try to find preferred network interface first
    for (const pattern of preferredPatterns) {
        for (const name of Object.keys(interfaces)) {
            if (name.includes(pattern)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        return iface.address;
                    }
                }
            }
        }
    }
    
    // Fallback to any IPv4 address
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const localIP = getLocalIP();

// Start HTTP server on port 3000
http.createServer(app).listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
    console.log(`📱 Mobile Access: http://${localIP}:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Ready for mobile camera scanning!`);
});