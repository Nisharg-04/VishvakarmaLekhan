import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage.js';
import EventReport from '../models/EventReport.js';
import dotenv from 'dotenv';

dotenv.config();

class VishvakarmaAIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });
    }

    /**
     * Generate AI response with context awareness
     * @param {string} userMessage - User's message
     * @param {string} userId - User ID
     * @param {string} sessionId - Chat session ID
     * @param {string} reportContext - Optional report context
     * @returns {Promise<string>} - AI response
     */
    async generateResponse(userMessage, userId, sessionId, reportContext = null) {
        try {
            const startTime = Date.now();

            // Get conversation history (last 5 messages for context)
            const conversationHistory = await this.getConversationHistory(userId, sessionId, 5);

            // Get report context if provided
            let reportData = null;
            if (reportContext) {
                reportData = await EventReport.findById(reportContext);
            }

            // Create context-aware prompt
            const prompt = this.createContextualPrompt(userMessage, conversationHistory, reportData);

            // Generate AI response
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const aiResponse = response.text();

            const responseTime = Date.now() - startTime;

            // Save user message
            await this.saveMessage(userId, sessionId, 'user', userMessage, {
                reportContext: reportContext,
                responseTime: responseTime
            });

            // Save AI response
            await this.saveMessage(userId, sessionId, 'assistant', aiResponse, {
                reportContext: reportContext,
                responseTime: responseTime
            });

            return aiResponse;

        } catch (error) {
            console.error('Error generating Vishvakarma AI response:', error);
            throw new Error('Failed to generate AI response: ' + error.message);
        }
    }

    /**
     * Create contextual prompt with history and report data
     * @param {string} userMessage - Current user message
     * @param {Array} history - Conversation history
     * @param {Object} reportData - Report context data
     * @returns {string} - Formatted prompt
     */
    createContextualPrompt(userMessage, history, reportData) {
        let prompt = `You are Vishvakarma AI, an intelligent assistant from the Vishvakarma Lekhan platform specialized in academic event reporting and documentation. Your motto is "Think Less, Report More" - you help users create professional event reports efficiently with minimal effort.

Your capabilities include:
- Helping with event report creation and formatting
- Providing content suggestions for different report sections
- Assisting with academic writing and documentation
- Answering questions about best practices in event reporting
- General assistance with academic and professional writing
- Making report generation effortless and professional

`;

        // Add conversation history for context
        if (history && history.length > 0) {
            prompt += `\nPrevious conversation context:\n`;
            history.reverse().forEach((msg, index) => {
                const role = msg.role === 'user' ? 'User' : 'Vishvakarma AI';
                prompt += `${role}: ${msg.content}\n`;
            });
            prompt += `\n`;
        }

        // Add report context if available
        if (reportData) {
            prompt += `\nCurrent Report Context:
- Event Title: ${reportData.title}
- Event Type: ${reportData.eventType}
- Organized By: ${reportData.organizedBy}
- Date: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}
- Venue: ${reportData.venue}
- Participants: ${reportData.participantCount}
- Status: ${reportData.status}

`;
        }

        prompt += `\nUser's Current Question/Request: ${userMessage}

Please provide a helpful, professional, and contextually relevant response. If the user is asking about report writing, provide specific and actionable advice. If they need content suggestions, be creative and professional. Maintain a friendly but professional tone throughout.`;

        return prompt;
    }

    /**
     * Get conversation history for context
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     * @param {number} limit - Number of messages to retrieve
     * @returns {Promise<Array>} - Conversation history
     */
    async getConversationHistory(userId, sessionId, limit = 5) {
        try {
            const messages = await ChatMessage.find({
                userId: userId,
                sessionId: sessionId
            })
                .sort({ timestamp: -1 })
                .limit(limit * 2) // Get both user and AI messages
                .select('role content timestamp')
                .lean();

            return messages;
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            return [];
        }
    }

    /**
     * Save chat message to database
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     * @param {string} role - Message role (user/assistant)
     * @param {string} content - Message content
     * @param {Object} metadata - Additional metadata
     */
    async saveMessage(userId, sessionId, role, content, metadata = {}) {
        try {
            const message = new ChatMessage({
                userId,
                sessionId,
                role,
                content,
                metadata
            });

            await message.save();
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    }

    /**
     * Get user's chat sessions
     * @param {string} userId - User ID
     * @returns {Promise<Array>} - List of chat sessions
     */
    async getChatSessions(userId) {
        try {
            const sessions = await ChatMessage.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: '$sessionId',
                        lastMessage: { $last: '$content' },
                        lastTimestamp: { $max: '$timestamp' },
                        messageCount: { $sum: 1 }
                    }
                },
                { $sort: { lastTimestamp: -1 } },
                { $limit: 20 }
            ]);

            return sessions.map(session => ({
                sessionId: session._id,
                lastMessage: session.lastMessage.substring(0, 50) + (session.lastMessage.length > 50 ? '...' : ''),
                lastTimestamp: session.lastTimestamp,
                messageCount: session.messageCount
            }));
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
            return [];
        }
    }

    /**
     * Get messages for a specific session
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     * @returns {Promise<Array>} - Chat messages
     */
    async getSessionMessages(userId, sessionId) {
        try {
            const messages = await ChatMessage.find({
                userId: userId,
                sessionId: sessionId
            })
                .sort({ timestamp: 1 })
                .select('role content timestamp metadata')
                .lean();

            return messages;
        } catch (error) {
            console.error('Error fetching session messages:', error);
            return [];
        }
    }

    /**
     * Delete a chat session
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID
     */
    async deleteSession(userId, sessionId) {
        try {
            await ChatMessage.deleteMany({
                userId: userId,
                sessionId: sessionId
            });
        } catch (error) {
            console.error('Error deleting chat session:', error);
            throw new Error('Failed to delete chat session');
        }
    }

    /**
     * Generate content suggestions for report sections
     * @param {string} sectionType - Type of section (introduction, highlights, etc.)
     * @param {Object} reportData - Report context
     * @returns {Promise<string>} - Content suggestions
     */
    async generateContentSuggestions(sectionType, reportData) {
        try {
            const prompt = `Generate professional content suggestions for the "${sectionType}" section of an academic event report.

Event Details:
- Title: ${reportData.title}
- Type: ${reportData.eventType}
- Organized By: ${reportData.organizedBy}
- Participants: ${reportData.participantCount}
- Duration: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}

Provide 2-3 well-structured paragraph suggestions that are professional, informative, and suitable for academic documentation. Focus on the specific requirements of the "${sectionType}" section.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('Error generating content suggestions:', error);
            throw new Error('Failed to generate content suggestions');
        }
    }
}

export default new VishvakarmaAIService();
