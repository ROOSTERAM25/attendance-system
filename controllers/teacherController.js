const QRCode = require('qrcode');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');

// Show teacher dashboard
exports.getDashboard = (req, res) => {
    res.render('teacher/dashboard', { 
        user: req.user 
    });
};

// Start attendance session
exports.startSession = async (req, res) => {
    try {
        const { subject, className, section } = req.body;

        if (!subject || !className || !section) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Check if there's already an active session
        const existingSession = await AttendanceSession.findOne({
            teacher: req.user._id,
            isActive: true
        });

        if (existingSession) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please end the current session before starting a new one' 
            });
        }

        // Generate unique QR code data
        const qrData = crypto.randomBytes(32).toString('hex');
        const qrExpiry = new Date(Date.now() + parseInt(process.env.QR_REFRESH_INTERVAL));

        // Create session
        const session = await AttendanceSession.create({
            teacher: req.user._id,
            subject,
            class: className,
            section,
            qrCode: qrData,
            qrExpiry
        });

        res.json({
            success: true,
            message: 'Session started successfully',
            sessionId: session._id
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to start session: ' + error.message 
        });
    }
};

// Get active session
exports.getActiveSession = async (req, res) => {
    try {
        const session = await AttendanceSession.findOne({
            teacher: req.user._id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'No active session found' 
            });
        }

        // Check if request is for API (JSON) or view (HTML)
        const requestedFormat = req.accepts(['json', 'html']);
        
        if (requestedFormat === 'json' || req.headers.accept === 'application/json') {
            return res.json({
                success: true,
                session
            });
        }

        res.render('teacher/session', { 
            user: req.user,
            session 
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get session' 
        });
    }
};

// Generate new QR code
exports.refreshQR = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
            teacher: req.user._id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        // Generate new QR code
        const qrData = crypto.randomBytes(32).toString('hex');
        const qrExpiry = new Date(Date.now() + parseInt(process.env.QR_REFRESH_INTERVAL));

        session.qrCode = qrData;
        session.qrExpiry = qrExpiry;
        await session.save();

        // Generate QR code image
        const qrCodeImage = await QRCode.toDataURL(JSON.stringify({
            sessionId: session._id,
            qrCode: qrData,
            expiry: qrExpiry
        }));

        res.json({
            success: true,
            qrCodeImage,
            expiry: qrExpiry
        });
    } catch (error) {
        console.error('Refresh QR error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to refresh QR code' 
        });
    }
};

// End session
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
            teacher: req.user._id,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        session.isActive = false;
        session.endedAt = new Date();
        await session.save();

        res.json({
            success: true,
            message: 'Session ended successfully'
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to end session' 
        });
    }
};

// View attendance records
exports.viewAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
            teacher: req.user._id
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        const records = await AttendanceRecord.find({ session: sessionId })
            .populate('student', 'name rollNumber email')
            .sort({ markedAt: -1 });

        res.render('teacher/attendance', {
            user: req.user,
            session,
            records
        });
    } catch (error) {
        console.error('View attendance error:', error);
        res.status(500).send('Failed to load attendance records');
    }
};

// Export attendance to Excel
exports.exportToExcel = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findOne({
            _id: sessionId,
            teacher: req.user._id
        });

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: 'Session not found' 
            });
        }

        const records = await AttendanceRecord.find({ session: sessionId })
            .populate('student', 'name rollNumber email')
            .sort({ markedAt: -1 });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        // Add title and session info
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = 'ATTENDANCE REPORT';
        worksheet.getCell('A1').font = { bold: true, size: 14 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = `Subject: ${session.subject} | Class: ${session.class} | Section: ${session.section}`;
        worksheet.getCell('A2').font = { size: 11 };

        worksheet.mergeCells('A3:F3');
        worksheet.getCell('A3').value = `Date: ${session.createdAt.toLocaleDateString()} | Time: ${session.createdAt.toLocaleTimeString()}`;
        worksheet.getCell('A3').font = { size: 10 };

        // Add headers
        const headers = ['S.No', 'Student Name', 'Roll Number', 'Email', 'Status', 'Marked At'];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        headerRow.alignment = { horizontal: 'center' };

        // Add data
        records.forEach((record, index) => {
            const row = worksheet.addRow([
                index + 1,
                record.student.name,
                record.student.rollNumber || 'N/A',
                record.student.email,
                record.status.toUpperCase(),
                record.markedAt.toLocaleString()
            ]);

            // Color code status
            if (record.status === 'present') {
                row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            } else {
                row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            }

            row.alignment = { horizontal: 'center' };
        });

        // Adjust column widths
        worksheet.columns = [
            { width: 8 },
            { width: 20 },
            { width: 15 },
            { width: 25 },
            { width: 12 },
            { width: 20 }
        ];

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="attendance_${session.subject}_${new Date().toISOString().split('T')[0]}.xlsx"`);

        // Write workbook to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to export attendance: ' + error.message 
        });
    }
};