import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Generate comprehensive event report content using Gemini AI
     * @param {Object} reportData - The event report data
     * @returns {Promise<string>} - Generated report content
     */
    async generateReportContent(reportData) {
        try {
            const prompt = this.createReportPrompt(reportData);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const generatedText = response.text();

            return generatedText;
        } catch (error) {
            console.error('Error generating AI content:', error);
            throw new Error('Failed to generate AI content: ' + error.message);
        }
    }

    /**
     * Create a comprehensive prompt for report generation
     * @param {Object} reportData - The event report data
     * @returns {string} - The formatted prompt
     */
    createReportPrompt(reportData) {
        const facultyCoordinatorsList = reportData.facultyCoordinators?.map(fc =>
            `${fc.name} (${fc.position})`
        ).join(', ') || 'Not specified';

        const contentBlocksText = reportData.contentBlocks?.map(block => {
            switch (block.type) {
                case 'text':
                    return `Text Section - ${block.title}: ${block.content}`;
                case 'quote':
                    return `Quote - ${block.title}: "${block.content}"`;
                case 'achievement':
                    return `Achievement - ${block.title}: ${block.content}`;
                default:
                    return `${block.title}: ${block.content}`;
            }
        }).join('\n') || 'No additional content blocks provided';

        const prompt = `You are a professional report writer for an educational institution. Generate a comprehensive, well-structured, and professional event report based on the following details. The report should be formal, engaging, and suitable for academic documentation.

EVENT DETAILS:
- Event Title: ${reportData.title}
- Event Type: ${reportData.eventType}
- Institute: ${reportData.institute}
- Organized By: ${reportData.organizedBy}
- Start Date: ${new Date(reportData.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
- End Date: ${new Date(reportData.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
- Venue: ${reportData.venue}
- Target Audience: ${reportData.targetAudience}
- Participant Count: ${reportData.participantCount}
- Faculty Coordinators: ${facultyCoordinatorsList}

ADDITIONAL CONTENT:
${contentBlocksText}

REPORT STRUCTURE REQUIREMENTS:
1. **Introduction**: Context and objectives of the event
2. **Event Details**: Comprehensive description of the event proceedings
3. **Key Highlights**: Major achievements and memorable moments
4. **Participant Engagement**: Description of audience participation and feedback
5. **Faculty Coordination**: Recognition of organizing team's efforts
6. **Learning Outcomes**: Educational value and knowledge gained
7. **Impact and Results**: Concrete outcomes and achievements
8. **Conclusion**: Summary of success and future recommendations

NOTE: Do NOT include an executive summary section in this report. Focus on detailed content for each section above.

WRITING GUIDELINES:
- Use professional, academic language appropriate for institutional reports
- Include specific details from the provided data
- Maintain a positive and constructive tone
- Structure content with clear headings and logical flow
- Incorporate the additional content blocks naturally into the narrative
- Ensure the report is comprehensive yet concise (800-1200 words)
- Use proper formatting with bullet points where appropriate
- Include quantitative data (dates, participant count, etc.) naturally
- Reflect the educational mission and values of the institution

Please generate a complete, professional report that can be used for official documentation and future reference. The report should demonstrate the educational impact and success of the event while maintaining academic writing standards.`;

        return prompt;
    }

    /**
     * Generate event summary for quick overview
     * @param {Object} reportData - The event report data
     * @returns {Promise<string>} - Generated summary
     */
    async generateEventSummary(reportData) {
        try {
            const prompt = `Generate a comprehensive executive summary for the following event. This summary should be detailed and suitable for summary reports:

Event: ${reportData.title}
Type: ${reportData.eventType}
Institute: ${reportData.institute}
Organized By: ${reportData.organizedBy}
Participants: ${reportData.participantCount}
Duration: ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}
Venue: ${reportData.venue}
Target Audience: ${reportData.targetAudience}

Additional Content: ${reportData.contentBlocks?.map(block => `${block.title}: ${block.content}`).join('; ') || 'None'}

Generate a detailed executive summary that includes:
- Overview of the event and its objectives
- Key highlights and achievements
- Participant engagement and learning outcomes
- Impact and significance of the event
- Notable accomplishments and success metrics

The summary should be 10-15 sentences long, professional, and comprehensive enough to provide a complete understanding of the event's success and impact. Use formal academic language appropriate for institutional documentation.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating event summary:', error);
            throw new Error('Failed to generate event summary: ' + error.message);
        }
    }

    /**
     * Generate recommendations based on event data
     * @param {Object} reportData - The event report data
     * @returns {Promise<string>} - Generated recommendations
     */
    async generateRecommendations(reportData) {
        try {
            const prompt = `Based on the following event details, generate 3-5 actionable recommendations for future similar events:

Event: ${reportData.title}
Type: ${reportData.eventType}
Participants: ${reportData.participantCount}
Venue: ${reportData.venue}
Target Audience: ${reportData.targetAudience}

Content Areas: ${reportData.contentBlocks?.map(block => block.title).join(', ') || 'General'}

Provide specific, practical recommendations that could improve future events. Focus on organization, engagement, learning outcomes, and institutional development.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw new Error('Failed to generate recommendations: ' + error.message);
        }
    }

    /**
     * Generate content for individual content blocks
     * @param {string} blockType - The type of content block (text, quote, achievement, image)
     * @param {Object} context - Context information for content generation
     * @returns {Promise<string>} - Generated content for the block
     */
    async generateContentForBlock(blockType, context) {
        try {
            const prompt = this.createBlockPrompt(blockType, context);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const generatedText = response.text();

            return generatedText.trim();
        } catch (error) {
            console.error('Error generating AI content for block:', error);
            throw new Error('Failed to generate AI content for block: ' + error.message);
        }
    }

    /**
     * Create a specific prompt for content block generation
     * @param {string} blockType - The type of content block
     * @param {Object} context - Context information
     * @returns {string} - The formatted prompt
     */
    createBlockPrompt(blockType, context) {
        const baseContext = `
Event Context:
- Event Title: ${context.eventTitle || 'Not specified'}
- Event Type: ${context.eventType || 'Not specified'}
- Target Audience: ${context.targetAudience || 'Not specified'}
- Additional Info: ${context.additionalInfo || 'None'}
${context.existingContent ? `- Existing Content: ${context.existingContent}` : ''}
`;

        switch (blockType) {
            case 'text':
                return `${baseContext}

Generate professional, informative content for a text section in an academic event report. The content should be:
- Well-structured and professional
- Relevant to the event context
- Educational and informative
- 150-300 words
- Suitable for institutional documentation

Focus on providing valuable information about the event proceedings, learning outcomes, or key activities. Use formal academic language appropriate for educational institutions.`;

            case 'quote':
                return `${baseContext}

Generate an inspiring and relevant quote that would be appropriate for this educational event. The quote should be:
- Motivational and educational
- Relevant to the event theme
- Professional and meaningful
- From a credible source (educator, industry expert, or well-known figure)
- Include proper attribution

Format: "Quote text" - Attribution (Title/Position)

The quote should reflect the educational values and inspire participants or readers about the event's significance.`;

            case 'achievement':
                return `${baseContext}

Generate content describing a significant achievement or success from this event. The content should highlight:
- Specific accomplishments or milestones
- Impact on participants or institution
- Measurable outcomes when possible
- Recognition of excellence
- 100-200 words
- Professional and celebratory tone

Focus on concrete achievements like participation numbers, successful completion of objectives, positive feedback, or notable outcomes that demonstrate the event's success.`;

            case 'image':
                return `${baseContext}

Generate a professional caption or description for an image that would be included in this event report. The description should:
- Be concise but informative (50-100 words)
- Describe what the image likely shows (participants, activities, presentations, etc.)
- Connect the image to the event's objectives
- Use professional language
- Highlight the significance of the moment captured

Format the response as an image caption that would appear below a photograph in the report.`;

            default:
                return `${baseContext}

Generate professional content for a ${blockType} section in an academic event report. The content should be well-structured, informative, and appropriate for institutional documentation. Keep it concise but comprehensive, focusing on the educational value and professional significance of the event.`;
        }
    }

    /**
     * Test the AI service connection
     * @returns {Promise<boolean>} - Connection status
     */
    async testConnection() {
        try {
            const result = await this.model.generateContent("Test connection. Respond with 'AI Service Connected Successfully'");
            const response = await result.response;
            const text = response.text();
            return text.includes('Connected Successfully');
        } catch (error) {
            console.error('AI Service connection test failed:', error);
            return false;
        }
    }
}

export default new AIService();
