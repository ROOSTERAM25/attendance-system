const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['teacher', 'student', 'admin'],
        required: true
    },
    rollNumber: {
        type: String,
        sparse: true
    },
    department: {
        type: String,
        required: true
    },
    division: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving - DO NOT use 'next' with async
userSchema.pre('save', async function() {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);