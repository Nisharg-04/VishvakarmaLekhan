import express from 'express';
import { body, param, validationResult } from 'express-validator';
import EventReport from '../models/EventReport.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Test AI service connection (admin only)
router.get('/ai/test', adminAuth, async (req, res) => {
    try {
        console.log('Testing AI service connection...');
        const isConnected = await aiService.testConnection();

        if (isConnected) {
            res.json({
                success: true,
                message: 'AI service is connected and working properly',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                success: false,
                error: 'AI service connection test failed',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('AI service test error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test AI service: ' + error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/reports/ai/generate-content - Generate AI content for individual blocks
router.post('/ai/generate-content', auth, async (req, res) => {
    try {
        const { blockType, context } = req.body;

        if (!blockType || !context) {
            return res.status(400).json({ error: 'Block type and context are required' });
        }

        // Generate AI content based on block type
        const content = await aiService.generateContentForBlock(blockType, context);

        res.json({
            success: true,
            content: content,
            blockType: blockType,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating AI content for block:', error);
        res.status(500).json({
            error: 'Failed to generate AI content for block: ' + error.message
        });
    }
});

// POST /api/reports/generate-summary - Generate summary report (logo, basic details, AI summary, signatures)
router.post('/generate-summary', auth, async (req, res) => {
    try {
        const reportData = req.body;

        // Generate AI summary for the event
        const aiSummary = await aiService.generateEventSummary(reportData);

        // Create a simplified summary content (plain text format)
        const summaryContent = `
${reportData.title} - Event Summary

Event Details
Event: ${reportData.title}
Type: ${reportData.eventType}
Date: ${new Date(reportData.startDate).toLocaleDateString('en-IN')} to ${new Date(reportData.endDate).toLocaleDateString('en-IN')}
Venue: ${reportData.venue}
Participants: ${reportData.participantCount}
Organized by: ${reportData.organizedBy}

Executive Summary
${aiSummary}

Prepared by: ${reportData.institute}
Report Date: ${new Date().toLocaleDateString('en-IN')}
        `.trim();

        res.json({
            success: true,
            content: summaryContent,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating summary report:', error);

        // Fallback summary without AI (plain text format)
        const fallbackSummary = `
${req.body.title} - Event Summary

Event Details
Event: ${req.body.title}
Type: ${req.body.eventType}
Date: ${new Date(req.body.startDate).toLocaleDateString('en-IN')} to ${new Date(req.body.endDate).toLocaleDateString('en-IN')}
Venue: ${req.body.venue}
Participants: ${req.body.participantCount}
Organized by: ${req.body.organizedBy}

Executive Summary
This comprehensive ${req.body.eventType} titled "${req.body.title}" was successfully conducted by ${req.body.organizedBy} at ${req.body.institute}. The event demonstrated exceptional organization and achieved its educational objectives with remarkable participation from ${req.body.participantCount} attendees. The event was strategically designed to provide valuable learning opportunities and practical knowledge to the target audience. 

The high level of participant engagement throughout the event was evident from active participation in various sessions and activities. The professional organization and seamless coordination reflected the institutional excellence and commitment to quality education. The event successfully facilitated knowledge transfer, created networking opportunities among participants, and contributed significantly to the professional development of all attendees.

The positive outcomes achieved validate the effectiveness of well-planned educational initiatives and highlight the institution's position as a leading educational organization. The event's success reinforces the importance of continued investment in such programs and demonstrates the dedication of the organizing team in delivering quality educational experiences. This event serves as a benchmark for future similar initiatives and contributes to the institution's mission of providing relevant and timely learning opportunities.

Prepared by: ${req.body.institute}
Report Date: ${new Date().toLocaleDateString('en-IN')}
        `.trim();

        res.json({
            success: true,
            content: fallbackSummary,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/reports - Get all reports (requires authentication)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};

        // User is already authenticated via auth middleware
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        // Apply filters based on user type
        if (isAdmin) {
            // Admin can see all reports
        } else {
            // Regular user can only see their own reports
            query.createdBy = userId;
        }

        // Filter by status if provided
        if (status && ['draft', 'generated'].includes(status)) {
            query.status = status;
        }

        // Search in title and organizedBy if search term provided
        if (search) {
            const searchQuery = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { organizedBy: { $regex: search, $options: 'i' } }
                ]
            };

            if (query.$and) {
                query.$and.push(searchQuery);
            } else {
                Object.assign(query, searchQuery);
            }
        }

        const reports = await EventReport.find(query)
            .populate('createdBy', 'name email')
            .populate('lastModifiedBy', 'name email')
            .sort({ createdAt: -1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit)
            .select('-generatedContent'); // Exclude large content from list view

        const total = await EventReport.countDocuments(query);

        res.json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/reports/admin/all - Get all reports (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const { status, search, limit = 50, page = 1 } = req.query;
        const query = {};

        // Filter by status if provided
        if (status && ['draft', 'generated'].includes(status)) {
            query.status = status;
        }

        // Search in title and organizedBy if search term provided
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { organizedBy: { $regex: search, $options: 'i' } }
            ];
        }

        const reports = await EventReport.find(query)
            .populate('createdBy', 'name email department rollNumber')
            .populate('lastModifiedBy', 'name email')
            .sort({ createdAt: -1 })

            .select('-generatedContent');

        const total = await EventReport.countDocuments(query);

        res.json({
            reports,


            total
        });
    } catch (error) {
        console.error('Error fetching all reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// GET /api/reports/admin/:id - Get a specific report (Admin only - can view any report)
router.get('/admin/:id', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, adminAuth, async (req, res) => {
    try {
        const report = await EventReport.findById(req.params.id)
            .populate('createdBy', 'name email department rollNumber')
            .populate('lastModifiedBy', 'name email');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Error fetching report for admin:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// GET /api/reports/:id - Get a specific report (authentication required)
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const report = await EventReport.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('lastModifiedBy', 'name email');

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if user is authorized to view this report
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (isAdmin || (report.createdBy && report.createdBy._id.toString() === userId)) {
            return res.json(report);
        }

        return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// GET /api/reports/:id/ai-summary - Generate AI summary for a specific report
router.get('/:id/ai-summary', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const report = await EventReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if user is authorized to access this report
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && (!report.createdBy || report.createdBy.toString() !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Generate AI summary
        const summary = await aiService.generateEventSummary(report);

        res.json({
            success: true,
            summary: summary,
            reportId: report._id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating AI summary:', error);
        res.status(500).json({
            error: 'Failed to generate AI summary: ' + error.message
        });
    }
});

// GET /api/reports/:id/ai-recommendations - Generate AI recommendations for a specific report
router.get('/:id/ai-recommendations', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const report = await EventReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if user is authorized to access this report
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin && (!report.createdBy || report.createdBy.toString() !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Generate AI recommendations
        const recommendations = await aiService.generateRecommendations(report);

        res.json({
            success: true,
            recommendations: recommendations,
            reportId: report._id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating AI recommendations:', error);
        res.status(500).json({
            error: 'Failed to generate AI recommendations: ' + error.message
        });
    }
});

// POST /api/reports - Create a new report (requires authentication)
router.post('/', [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('eventType').trim().notEmpty().withMessage('Event type is required'),
    body('organizedBy').trim().notEmpty().withMessage('Organized by is required'),
    body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
    body('semester').trim().notEmpty().withMessage('Semester is required'),
    body('targetAudience').trim().notEmpty().withMessage('Target audience is required'),
    body('participantCount').isInt({ min: 0 }).withMessage('Participant count must be a positive number'),
    body('selectedLogos').isArray({ min: 1 }).withMessage('At least one logo must be selected'),
    body('facultyCoordinators').isArray({ min: 1 }).withMessage('At least one faculty coordinator is required'),
    body('studentCoordinators').isArray({ min: 1 }).withMessage('At least one student coordinator is required')
], handleValidationErrors, auth, async (req, res) => {
    try {
        // Validate date range
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if (endDate < startDate) {
            return res.status(400).json({ error: 'End date cannot be before start date' });
        }

        const reportData = { ...req.body };

        // Set user information from auth middleware
        reportData.createdBy = req.user.userId;
        reportData.lastModifiedBy = req.user.userId;

        const report = new EventReport(reportData);
        await report.save();

        // Populate created report for response
        await report.populate('createdBy', 'name email');

        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({ error: 'Failed to create report' });
    }
});

// PUT /api/reports/:id - Update a report
router.put('/:id', [
    param('id').isMongoId().withMessage('Invalid report ID'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('venue').optional().trim().notEmpty().withMessage('Venue cannot be empty'),
    body('eventType').optional().trim().notEmpty().withMessage('Event type cannot be empty'),
    body('organizedBy').optional().trim().notEmpty().withMessage('Organized by cannot be empty'),
    body('participantCount').optional().isInt({ min: 0 }).withMessage('Participant count must be a positive number')
], handleValidationErrors, auth, async (req, res) => {
    try {
        // Find the report first to check ownership
        const existingReport = await EventReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // User info from auth middleware
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        // Check if user can modify this report
        const canModify = isAdmin || (existingReport.createdBy && existingReport.createdBy.toString() === userId);

        if (!canModify) {
            return res.status(403).json({ error: 'Access denied. You can only modify your own reports.' });
        }

        // Validate date range if both dates are provided
        if (req.body.startDate && req.body.endDate) {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);

            if (endDate < startDate) {
                return res.status(400).json({ error: 'End date cannot be before start date' });
            }
        }

        const updateData = { ...req.body };
        if (userId) {
            updateData.lastModifiedBy = userId;
        }

        const report = await EventReport.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
            .populate('lastModifiedBy', 'name email');

        res.json(report);
    } catch (error) {
        console.error('Error updating report:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        res.status(500).json({ error: 'Failed to update report' });
    }
});

// DELETE /api/reports/:id - Delete a report (requires ownership or admin)
router.delete('/:id', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, async (req, res) => {
    try {
        // Find the report first to check ownership
        const existingReport = await EventReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        let userId = null;
        let isAdmin = false;

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.userId;
                isAdmin = decoded.role === 'admin';
            } catch (err) {
                // Invalid token
            }
        }

        // Check if user can delete this report
        const canDelete = isAdmin ||
            (existingReport.createdBy && existingReport.createdBy.toString() === userId);

        if (!canDelete) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own reports.' });
        }

        await EventReport.findByIdAndDelete(req.params.id);
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

// POST /api/reports/:id/generate - Generate report content
router.post('/:id/generate', [
    param('id').isMongoId().withMessage('Invalid report ID')
], handleValidationErrors, async (req, res) => {
    try {
        const report = await EventReport.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Simulate AI content generation (replace with actual AI integration)
        const generatedContent = await generateReportContent(report);

        // Update report with generated content
        report.generatedContent = generatedContent;
        report.status = 'generated';
        await report.save();

        res.json({
            message: 'Report generated successfully',
            report: report
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// AI-powered report content generation
const generateReportContent = async (reportData) => {
    try {
        console.log('Generating AI-powered report content...');

        // Use AI service to generate comprehensive report content
        const aiGeneratedContent = await aiService.generateReportContent(reportData);

        console.log('AI content generation completed successfully');
        return aiGeneratedContent;

    } catch (error) {
        console.error('AI content generation failed:', error);

        // Fallback to enhanced template-based content if AI fails
        console.log('Falling back to template-based content generation...');

        const fallbackContent = generateFallbackContent(reportData);
        return fallbackContent;
    }
};

// Enhanced fallback content generator
const generateFallbackContent = (reportData) => {
    const eventDuration = calculateEventDuration(reportData.startDate, reportData.endDate);
    const facultyList = reportData.facultyCoordinators?.map(fc =>
        `${fc.name} (${fc.position})`
    ).join(', ') || 'the organizing committee';

    const contentBlocksFormatted = formatContentBlocks(reportData.contentBlocks);

    return `
# ${reportData.title} - Event Report

## Introduction
The ${reportData.eventType} titled "${reportData.title}" was successfully conducted by ${reportData.organizedBy} at ${reportData.institute}. This ${eventDuration} event demonstrated exceptional organization and achieved its educational objectives with remarkable participation from ${reportData.participantCount} attendees.

## Event Overview
**Event Details:**
- **Title:** ${reportData.title}
- **Type:** ${reportData.eventType}
- **Organizing Body:** ${reportData.organizedBy}
- **Institution:** ${reportData.institute}
- **Duration:** ${new Date(reportData.startDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    })} to ${new Date(reportData.endDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    })}
- **Venue:** ${reportData.venue}
- **Target Audience:** ${reportData.targetAudience}
- **Participants:** ${reportData.participantCount} attendees

## Faculty Coordination and Leadership
The event was meticulously coordinated under the guidance of ${facultyList}. Their dedicated efforts and strategic planning contributed significantly to the event's success, ensuring smooth execution and meaningful learning experiences for all participants.

## Event Proceedings and Highlights
The ${reportData.eventType} was structured to maximize participant engagement and learning outcomes. Key highlights of the event include:

- **High Participation:** The event attracted ${reportData.participantCount} participants, demonstrating strong interest in the subject matter
- **Quality Content:** Well-structured sessions that provided valuable insights and practical knowledge
- **Professional Organization:** Seamless coordination and execution reflecting institutional excellence
- **Interactive Sessions:** Engaging activities that promoted active participation and knowledge sharing

${contentBlocksFormatted}

## Educational Impact and Learning Outcomes
The event successfully achieved its educational objectives by:
- Providing participants with current industry insights and best practices
- Facilitating knowledge transfer through expert interactions
- Creating networking opportunities among participants
- Enhancing practical skills and theoretical understanding
- Contributing to the professional development of attendees

## Participant Engagement and Feedback
The high level of participant engagement throughout the event was evident from:
- Active participation in Q&A sessions
- Positive response to interactive activities
- Constructive feedback and suggestions
- Networking and collaboration among attendees
- Expressed interest in future similar events

## Institutional Excellence
This event exemplifies ${reportData.institute}'s commitment to:
- **Quality Education:** Providing relevant and timely learning opportunities
- **Professional Development:** Supporting skill enhancement and career growth
- **Industry Connection:** Bridging academic learning with practical applications
- **Community Building:** Fostering collaborative learning environments

## Conclusion and Future Recommendations
The successful execution of "${reportData.title}" reinforces ${reportData.institute}'s position as a leading educational institution. The event's positive outcomes validate the effectiveness of well-planned educational initiatives and highlight the importance of continued investment in such programs.

**Recommendations for Future Events:**
- Continue organizing similar events to maintain momentum in professional development
- Explore opportunities for follow-up sessions or advanced modules
- Consider expanding the target audience to reach more beneficiaries
- Document best practices for replication in other departments or programs
- Establish feedback mechanisms for continuous improvement

This comprehensive report documents the successful completion of the event and serves as a reference for future planning and institutional assessment. The positive outcomes achieved reflect the dedication of the organizing team and the high standards maintained by ${reportData.institute} in delivering quality educational experiences.

---
*Report generated on ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    })} for ${reportData.institute}*
`.trim();
};

// Helper function to calculate event duration
const calculateEventDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'one-day';
    if (diffDays === 2) return 'two-day';
    if (diffDays <= 7) return `${diffDays}-day`;
    return 'multi-day';
};

// Helper function to format content blocks
const formatContentBlocks = (contentBlocks) => {
    if (!contentBlocks || contentBlocks.length === 0) {
        return '## Additional Event Content\nDetailed proceedings and activities were conducted as planned, contributing to the overall success of the event.';
    }

    return contentBlocks.map(block => {
        switch (block.type) {
            case 'text':
                return `## ${block.title}\n${block.content}`;
            case 'quote':
                return `## Featured Quote\n> "${block.content}"\n> *- ${block.title}*`;
            case 'achievement':
                return `## 🏆 Achievement: ${block.title}\n${block.content}`;
            default:
                return `## ${block.title}\n${block.content}`;
        }
    }).join('\n\n');
};

export default router;
