const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Show student dashboard
exports.getDashboard = (req, res) => {
    res.render('student/dashboard', { 
        user: req.user 
    });
};

// Show QR scanner page
exports.getScanPage = (req, res) => {
    res.render('student/scan', { 
        user: req.user 
    });
};

// Mark attendance
exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, qrCode, latitude, longitude } = req.body;

        // Validate inputs
        if (!sessionId || !qrCode || !latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required information' 
            });
        }

        // Find session
        const session = await AttendanceSession.findOne({
            _id: sessionId,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found or has ended' 
            });
        }

        // Verify QR code
        if (session.qrCode !== qrCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired QR code' 
            });
        }

        // Check QR expiry
        if (new Date() > session.qrExpiry) {
            return res.status(400).json({ 
                success: false, 
                message: 'QR code has expired. Please scan the new one' 
            });
        }

        // Check if already marked attendance
        const existingRecord = await AttendanceRecord.findOne({
            session: sessionId,
            student: req.user._id
        });

        if (existingRecord) {
            return res.status(400).json({ 
                success: false, 
                message: 'Attendance already marked for this session' 
            });
        }

        // Verify location (geo-fencing)
        const collegeLat = parseFloat(process.env.COLLEGE_LATITUDE);
        const collegeLon = parseFloat(process.env.COLLEGE_LONGITUDE);
        const allowedRadius = parseFloat(process.env.COLLEGE_RADIUS);

        const distance = calculateDistance(
            collegeLat, 
            collegeLon, 
            parseFloat(latitude), 
            parseFloat(longitude)
        );

        let status = 'present';
        let rejectionReason = null;

        if (distance > allowedRadius) {
            status = 'rejected';
            rejectionReason = `Outside college premises (${Math.round(distance)}m away)`;
        }

        // Create attendance record
        const record = await AttendanceRecord.create({
            session: sessionId,
            student: req.user._id,
            subject: session.subject,
            class: session.class,
            section: session.section,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            status,
            rejectionReason
        });

        res.json({
            success: true,
            message: status === 'present' 
                ? 'Attendance marked successfully!' 
                : 'Attendance rejected: ' + rejectionReason,
            status
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Attendance already marked for this session' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to mark attendance: ' + error.message 
        });
    }
};

// View own attendance history
exports.viewHistory = async (req, res) => {
    try {
        const records = await AttendanceRecord.find({ 
            student: req.user._id 
        })
        .populate('session', 'subject class section createdAt')
        .sort({ markedAt: -1 })
        .limit(50);

        res.render('student/history', {
            user: req.user,
            records
        });
    } catch (error) {
        console.error('View history error:', error);
        res.status(500).send('Failed to load attendance history');
    }
};