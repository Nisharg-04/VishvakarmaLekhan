import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, rollNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate username from email if not provided
        const username = email.split('@')[0];

        // Check for username uniqueness
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            // Add random number to make it unique
            const randomSuffix = Math.floor(Math.random() * 1000);
            var finalUsername = `${username}${randomSuffix}`;
        } else {
            var finalUsername = username;
        }

        // Check for roll number uniqueness if provided
        if (rollNumber) {
            const existingRoll = await User.findOne({ rollNumber });
            if (existingRoll) {
                return res.status(400).json({ message: 'User already exists with this roll number' });
            }
        }

        // Create new user
        const user = new User({
            username: finalUsername,
            fullName: name,
            email,
            password,
            department: department || 'General',
            rollNumber
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated. Please contact admin.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: user.getPublicProfile() });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, department, designation, contactNumber, rollNumber } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check for email uniqueness if changing
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Check for roll number uniqueness if changing
        if (rollNumber && rollNumber !== user.rollNumber) {
            const existingRoll = await User.findOne({ rollNumber, _id: { $ne: user._id } });
            if (existingRoll) {
                return res.status(400).json({ message: 'Roll number already exists' });
            }
        }

        // Update fields
        user.fullName = name;
        user.email = email;
        if (department) user.department = department;
        if (designation) user.designation = designation;
        if (contactNumber) user.contactNumber = contactNumber;
        if (rollNumber) user.rollNumber = rollNumber;

        // Update last modified date
        user.updatedAt = new Date();

        await user.save();

        // Create response with mapped fields for frontend compatibility
        const userResponse = {
            ...user.getPublicProfile(),
            name: user.fullName, // Map fullName to name for frontend compatibility
            _id: user._id
        };

        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password (will be hashed in pre-save middleware)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
});

// Admin Routes
// Get all users (Admin only)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        // Format users data for frontend compatibility
        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.fullName || user.username,
            email: user.email,
            role: user.role,
            department: user.department || '',
            designation: user.designation || '',
            contactNumber: user.contactNumber || '',
            rollNumber: user.rollNumber || '',
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        res.json({
            users: formattedUsers
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user role (Admin only)
router.put('/users/:userId/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user or admin' });
        }

        // Prevent self-demotion
        if (req.user.userId === req.params.userId && role === 'user') {
            return res.status(400).json({ message: 'Cannot demote yourself' });
        }

        user.role = role;
        await user.save();

        const formattedUser = {
            _id: user._id,
            name: user.fullName || user.username,
            email: user.email,
            role: user.role,
            department: user.department || '',
            designation: user.designation || '',
            contactNumber: user.contactNumber || '',
            rollNumber: user.rollNumber || '',
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        res.json({
            message: `User role updated to ${role} successfully`,
            user: formattedUser
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (Admin only) - Legacy route with pagination
router.get('/admin/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            users,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user status (Admin only)
router.put('/admin/users/:userId/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Promote user to admin (Admin only)
router.put('/admin/users/:userId/promote', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        user.role = 'admin';
        await user.save();

        res.json({
            message: 'User promoted to admin successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Promote user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create admin user (Super admin function)
router.post('/admin/create-admin', adminAuth, async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        // Check if requesting user is admin
        const requestingUser = await User.findById(req.user.userId);
        if (requestingUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create admin users' });
        }

        const admin = await User.createAdmin(name, email, password, department);

        res.status(201).json({
            message: 'Admin user created successfully',
            user: admin.getPublicProfile()
        });
    } catch (error) {
        if (error.message === 'Admin with this email already exists') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Create admin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user statistics (Admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get login statistics
        const usersWithLastLogin = await User.countDocuments({ lastLogin: { $exists: true } });
        const recentlyActive = await User.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        res.json({
            totalUsers,
            activeUsers,
            adminUsers,
            recentUsers,
            inactiveUsers: totalUsers - activeUsers,
            usersWithLastLogin,
            recentlyActive
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset user password (Admin only)
router.put('/admin/users/:userId/reset-password', adminAuth, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password reset successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk operations for users (Admin only)
router.post('/admin/users/bulk-action', adminAuth, async (req, res) => {
    try {
        const { action, userIds } = req.body;

        if (!action || !userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid request format' });
        }

        let result = {};
        const currentUserId = req.user.userId;

        switch (action) {
            case 'activate':
                await User.updateMany(
                    { _id: { $in: userIds } },
                    { isActive: true }
                );
                result = { message: `${userIds.length} users activated successfully` };
                break;

            case 'deactivate':
                // Prevent self-deactivation
                const safeUserIds = userIds.filter(id => id !== currentUserId);
                await User.updateMany(
                    { _id: { $in: safeUserIds } },
                    { isActive: false }
                );
                result = {
                    message: `${safeUserIds.length} users deactivated successfully`,
                    skipped: userIds.length - safeUserIds.length > 0 ? 'Cannot deactivate yourself' : null
                };
                break;

            case 'promote':
                // Prevent promoting already admin users
                await User.updateMany(
                    { _id: { $in: userIds }, role: 'user' },
                    { role: 'admin' }
                );
                result = { message: `Users promoted to admin successfully` };
                break;

            case 'demote':
                // Prevent self-demotion
                const demoteUserIds = userIds.filter(id => id !== currentUserId);
                await User.updateMany(
                    { _id: { $in: demoteUserIds }, role: 'admin' },
                    { role: 'user' }
                );
                result = {
                    message: `Users demoted to user role successfully`,
                    skipped: userIds.length - demoteUserIds.length > 0 ? 'Cannot demote yourself' : null
                };
                break;

            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        res.json(result);
    } catch (error) {
        console.error('Bulk action error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (Admin only)
router.delete('/admin/users/:userId', adminAuth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user.userId;

        // Prevent self-deletion
        if (userId === currentUserId) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        res.json({
            message: 'User deleted successfully',
            deletedUser: {
                id: user._id,
                name: user.fullName || user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search users (Admin only)
router.get('/admin/users/search', adminAuth, async (req, res) => {
    try {
        const { q, role, department, isActive } = req.query;
        let query = {};

        if (q) {
            query.$or = [
                { fullName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (department) query.department = { $regex: department, $options: 'i' };
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(50);

        // Format users data for frontend compatibility
        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.fullName || user.username,
            email: user.email,
            role: user.role,
            department: user.department || '',
            designation: user.designation || '',
            contactNumber: user.contactNumber || '',
            rollNumber: user.rollNumber || '',
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        res.json({
            users: formattedUsers,
            count: formattedUsers.length
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk operations (Admin only)
router.put('/admin/users/bulk', adminAuth, async (req, res) => {
    try {
        const { action, userIds } = req.body;

        if (!action || !userIds || !Array.isArray(userIds)) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        let updateData = {};
        let message = '';

        switch (action) {
            case 'activate':
                updateData = { isActive: true };
                message = 'Users activated successfully';
                break;
            case 'deactivate':
                updateData = { isActive: false };
                message = 'Users deactivated successfully';
                break;
            case 'promote':
                updateData = { role: 'admin' };
                message = 'Users promoted to admin successfully';
                break;
            case 'demote':
                updateData = { role: 'user' };
                message = 'Users demoted to user successfully';
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updateData }
        );

        res.json({
            message,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk operation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export users data (Admin only)
router.get('/admin/users/export', adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        const csvData = users.map(user => ({
            id: user._id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            department: user.department || '',
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin || ''
        }));

        res.json({
            message: 'Users data exported successfully',
            data: csvData
        });
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
