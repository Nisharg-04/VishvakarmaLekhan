import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    reportsGenerated: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for user's reports
UserSchema.virtual('reports', {
    ref: 'EventReport',
    localField: '_id',
    foreignField: 'createdBy'
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
UserSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName,
        role: this.role,
        department: this.department,
        designation: this.designation,
        contactNumber: this.contactNumber,
        isActive: this.isActive,
        reportsGenerated: this.reportsGenerated,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
};

// Static method to create admin user
UserSchema.statics.createAdmin = async function (adminData) {
    const existingAdmin = await this.findOne({ role: 'admin' });
    if (existingAdmin) {
        throw new Error('Admin user already exists');
    }

    const admin = new this({
        ...adminData,
        role: 'admin'
    });

    return await admin.save();
};

const User = mongoose.model('User', UserSchema);

export default User;
