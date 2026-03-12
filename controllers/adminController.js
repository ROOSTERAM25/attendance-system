const User = require('../models/User');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');

// View all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const teachers = users.filter(u => u.role === 'teacher');
        const students = users.filter(u => u.role === 'student');

        res.render('admin/users', {
            users,
            teachers,
            students,
            totalUsers: users.length,
            totalTeachers: teachers.length,
            totalStudents: students.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).send('Failed to load users');
    }
};

// View all users as JSON (for API)
exports.getUsersJSON = async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            success: true,
            users: users.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                password: u.password,
                role: u.role,
                rollNumber: u.rollNumber || 'N/A',
                department: u.department,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        console.error('Get users JSON error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load users'
        });
    }
};

// View all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await AttendanceSession.find().populate('teacher', 'name email');
        
        res.render('admin/sessions', {
            sessions,
            totalSessions: sessions.length,
            activeSessions: sessions.filter(s => s.isActive).length
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).send('Failed to load sessions');
    }
};

// View all attendance records
exports.getAllAttendance = async (req, res) => {
    try {
        const records = await AttendanceRecord.find()
            .populate('student', 'name email rollNumber')
            .populate('session', 'subject class section')
            .sort({ markedAt: -1 });

        res.render('admin/attendance', {
            records,
            totalRecords: records.length,
            presentCount: records.filter(r => r.status === 'present').length,
            rejectedCount: records.filter(r => r.status === 'rejected').length
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).send('Failed to load attendance records');
    }
};

// Admin dashboard
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalSessions = await AttendanceSession.countDocuments();
        const totalAttendance = await AttendanceRecord.countDocuments();
        const activeSessions = await AttendanceSession.countDocuments({ isActive: true });

        res.render('admin/dashboard', {
            totalUsers,
            totalTeachers,
            totalStudents,
            totalSessions,
            activeSessions,
            totalAttendance
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Failed to load dashboard');
    }
};
