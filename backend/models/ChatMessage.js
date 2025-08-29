import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        reportContext: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EventReport'
        },
        tokens: Number,
        responseTime: Number
    }
}, {
    timestamps: true
});

// Index for efficient querying
chatMessageSchema.index({ userId: 1, sessionId: 1, timestamp: -1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
