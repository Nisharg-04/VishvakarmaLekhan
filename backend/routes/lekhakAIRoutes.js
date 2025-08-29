import express from 'express';
import { body, param, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import vishvakarmaAIService from '../services/lekhakAIService.js';
import { v4 as uuidv4 } from 'uuid';

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

// POST /api/lekhak-ai/chat - Send message to Vishvakarma AI
router.post('/chat', [
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string'),
    body('reportContext').optional().isMongoId().withMessage('Invalid report context ID')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const { message, reportContext } = req.body;
        const userId = req.user.userId;

        // Generate or use existing session ID
        let { sessionId } = req.body;
        if (!sessionId) {
            sessionId = uuidv4();
        }

        // Generate AI response
        const aiResponse = await vishvakarmaAIService.generateResponse(
            message,
            userId,
            sessionId,
            reportContext
        );

        res.json({
            success: true,
            response: aiResponse,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in Vishvakarma AI chat:', error);
        res.status(500).json({
            error: 'Failed to process chat message: ' + error.message
        });
    }
});

// GET /api/lekhak-ai/sessions - Get user's chat sessions
router.get('/sessions', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessions = await vishvakarmaAIService.getChatSessions(userId);

        res.json({
            success: true,
            sessions: sessions
        });

    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({
            error: 'Failed to fetch chat sessions'
        });
    }
});

// GET /api/lekhak-ai/sessions/:sessionId - Get messages for a specific session
router.get('/sessions/:sessionId', [
    param('sessionId').notEmpty().withMessage('Session ID is required')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;

        const messages = await vishvakarmaAIService.getSessionMessages(userId, sessionId);

        res.json({
            success: true,
            messages: messages,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Error fetching session messages:', error);
        res.status(500).json({
            error: 'Failed to fetch session messages'
        });
    }
});

// DELETE /api/lekhak-ai/sessions/:sessionId - Delete a chat session
router.delete('/sessions/:sessionId', [
    param('sessionId').notEmpty().withMessage('Session ID is required')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sessionId } = req.params;

        await vishvakarmaAIService.deleteSession(userId, sessionId);

        res.json({
            success: true,
            message: 'Chat session deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({
            error: 'Failed to delete chat session'
        });
    }
});

// POST /api/lekhak-ai/content-suggestions - Generate content suggestions for report sections
router.post('/content-suggestions', [
    body('sectionType').trim().notEmpty().withMessage('Section type is required'),
    body('reportData').isObject().withMessage('Report data is required')
], handleValidationErrors, auth, async (req, res) => {
    try {
        const { sectionType, reportData } = req.body;

        const suggestions = await vishvakarmaAIService.generateContentSuggestions(sectionType, reportData);

        res.json({
            success: true,
            suggestions: suggestions,
            sectionType: sectionType
        });

    } catch (error) {
        console.error('Error generating content suggestions:', error);
        res.status(500).json({
            error: 'Failed to generate content suggestions: ' + error.message
        });
    }
});

// GET /api/lekhak-ai/test - Test Vishvakarma AI service
router.get('/test', auth, async (req, res) => {
    try {
        const testMessage = "Hello Vishvakarma AI, please introduce yourself.";
        const userId = req.user.userId;
        const sessionId = 'test-session-' + Date.now();

        const response = await vishvakarmaAIService.generateResponse(testMessage, userId, sessionId);

        res.json({
            success: true,
            message: 'Vishvakarma AI service is working properly',
            testResponse: response
        });

    } catch (error) {
        console.error('Vishvakarma AI test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Vishvakarma AI service test failed: ' + error.message
        });
    }
});

export default router;
