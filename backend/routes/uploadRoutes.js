import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'text/csv': ['.csv'],
        'text/plain': ['.txt']
    };

    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: images (jpg, png, gif, webp), PDF, Word documents (doc, docx), PowerPoint (ppt, pptx), Excel files (xls, xlsx), CSV, and text files`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files per request
    }
});

// POST /api/upload/single - Upload a single file
router.post('/single', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`,
            uploadedAt: new Date().toISOString()
        };

        res.json({
            message: 'File uploaded successfully',
            file: fileInfo
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const filesInfo = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            uploadedAt: new Date().toISOString()
        }));

        res.json({
            message: `${req.files.length} files uploaded successfully`,
            files: filesInfo
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

// POST /api/upload/attendance - Upload attendance sheet(s) - Support multiple files
router.post('/attendance', upload.array('attendanceSheets', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No attendance sheets uploaded' });
        }

        // Validate that files are images only for attendance sheets
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
        if (invalidFiles.length > 0) {
            // Delete uploaded files if any are invalid
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(400).json({
                error: 'Invalid file type for attendance sheet. Please upload image files only (JPG, PNG, GIF, WEBP).'
            });
        }

        const filesInfo = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            uploadedAt: new Date().toISOString(),
            type: 'attendance'
        }));

        res.json({
            message: `${req.files.length} attendance image(s) uploaded successfully`,
            files: filesInfo
        });
    } catch (error) {
        console.error('Error uploading attendance sheets:', error);
        res.status(500).json({ error: 'Failed to upload attendance sheets' });
    }
});

// POST /api/upload/miscellaneous - Upload miscellaneous files
router.post('/miscellaneous', upload.array('miscellaneousFiles', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No miscellaneous files uploaded' });
        }

        const filesInfo = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/${file.filename}`,
            uploadedAt: new Date().toISOString(),
            type: 'miscellaneous'
        }));

        res.json({
            message: `${req.files.length} miscellaneous file(s) uploaded successfully`,
            files: filesInfo
        });
    } catch (error) {
        console.error('Error uploading miscellaneous files:', error);
        res.status(500).json({ error: 'Failed to upload miscellaneous files' });
    }
});

// DELETE /api/upload/:filename - Delete an uploaded file
router.delete('/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// GET /api/upload/info/:filename - Get file information
router.get('/info/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Get file stats
        const stats = fs.statSync(filePath);

        const fileInfo = {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            url: `/uploads/${filename}`
        };

        res.json(fileInfo);
    } catch (error) {
        console.error('Error getting file info:', error);
        res.status(500).json({ error: 'Failed to get file information' });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Maximum is 10 files per request.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field.' });
        }
    }

    if (error.message.includes('File type')) {
        return res.status(400).json({ error: error.message });
    }

    next(error);
});

export default router;
