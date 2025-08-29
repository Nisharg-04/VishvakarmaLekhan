import mongoose from 'mongoose';

const ContentBlockSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'quote', 'achievement'],
        required: true
    },
    title: {
        type: String,
        required: function () {
            // Title is optional for image blocks
            return this.type !== 'image';
        }
    },
    content: {
        type: String,
        required: function () {
            // Content is optional for image blocks
            return this.type !== 'image';
        }
    },
    imageUrl: String,
    imageUrls: [String],
    imageLayout: {
        type: String,
        enum: ['single', 'grid', 'row'],
        default: 'single'
    },
    caption: String,
    credit: String
}, {
    _id: false
});

const FacultyCoordinatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    }
}, {
    _id: false
});

const StudentCoordinatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNo: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    }
}, {
    _id: false
});

const ChiefGuestSchema = new mongoose.Schema({
    name: String,
    designation: String,
    affiliation: String
}, {
    _id: false
});

const EventReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tagline: {
        type: String,
        trim: true
    },
    selectedLogos: [{
        type: String,
        required: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        trim: true
    },
    organizedBy: {
        type: String,
        required: true,
        trim: true
    },
    institute: {
        type: String,
        required: true,
        default: 'Birla Vishvakarma Mahavidyalaya Engineering College',
        trim: true
    },
    academicYear: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    targetAudience: {
        type: String,
        required: true,
        trim: true
    },
    participantCount: {
        type: Number,
        required: true,
        min: 0
    },
    facultyCoordinators: [FacultyCoordinatorSchema],
    facultyCoordinator: FacultyCoordinatorSchema, // Keep for backward compatibility
    studentCoordinators: [StudentCoordinatorSchema],
    chiefGuest: ChiefGuestSchema,
    hostedBy: {
        type: String,
        trim: true
    },
    guestsOfHonor: {
        type: String,
        trim: true
    },
    specialMentions: {
        type: String,
        trim: true
    },
    contentBlocks: [ContentBlockSchema],
    attendanceSheets: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: Date
    }], // Support multiple attendance files (images and Word docs)
    attendanceSheet: {
        type: String, // Keep for backward compatibility
    },
    miscellaneousFiles: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: Date,
        description: String // Optional description for the file
    }], // Support miscellaneous files
    generatedContent: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'generated'],
        default: 'draft'
    },
    // User Association
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // User is now required
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
EventReportSchema.index({ title: 'text', organizedBy: 'text' });
EventReportSchema.index({ status: 1 });
EventReportSchema.index({ createdAt: -1 });
EventReportSchema.index({ startDate: -1 });

// Virtual for formatted date range
EventReportSchema.virtual('dateRange').get(function () {
    const start = this.startDate.toLocaleDateString();
    const end = this.endDate.toLocaleDateString();
    return start === end ? start : `${start} - ${end}`;
});

// Instance method to generate summary
EventReportSchema.methods.getSummary = function () {
    return {
        id: this._id,
        title: this.title,
        eventType: this.eventType,
        organizedBy: this.organizedBy,
        dateRange: this.dateRange,
        status: this.status,
        participantCount: this.participantCount,
        createdAt: this.createdAt
    };
};

// Static method to find recent reports
EventReportSchema.statics.findRecent = function (limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Pre-save middleware to update lastModifiedBy
EventReportSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.lastModifiedBy = 'system'; // Could be updated with actual user info
    }
    next();
});

const EventReport = mongoose.model('EventReport', EventReportSchema);

export default EventReport;
