const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    qrCode: {
        type: String,
        required: true
    },
    qrExpiry: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    }
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);