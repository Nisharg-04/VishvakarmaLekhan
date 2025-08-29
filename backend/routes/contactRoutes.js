import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { 
  sendContactEmail, 
  sendFeatureRequestEmail, 
  sendConfirmationEmail 
} from '../services/emailService.js';

const router = express.Router();

// Rate limiting for contact endpoints
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many contact form submissions from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware for contact form
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name must be less than 200 characters')
    .escape(),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
    .escape(),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .escape(),
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
];

// Validation middleware for feature request form
const validateFeatureRequestForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name must be less than 200 characters')
    .escape(),
  body('featureTitle')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Feature title must be between 5 and 200 characters')
    .escape(),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .escape(),
  body('useCase')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Use case must be between 10 and 1000 characters')
    .escape(),
  body('expectedBenefit')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Expected benefit must be less than 1000 characters')
    .escape(),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  body('category')
    .isIn(['general', 'ai', 'ui', 'export', 'collaboration', 'integration', 'security', 'performance'])
    .withMessage('Category must be a valid option'),
];

// Contact form submission endpoint
router.post('/contact', contactRateLimit, validateContactForm, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, organization, subject, message, priority } = req.body;

    // Send email to admins
    const adminEmailResult = await sendContactEmail({
      name,
      email,
      organization,
      subject,
      message,
      priority,
    });

    // Send confirmation email to user
    const userEmailResult = await sendConfirmationEmail(email, name, 'contact');

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: {
        adminEmailId: adminEmailResult.messageId,
        userEmailId: userEmailResult.messageId,
      },
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Feature request submission endpoint
router.post('/feature-request', contactRateLimit, validateFeatureRequestForm, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { 
      name, 
      email, 
      organization, 
      featureTitle, 
      description, 
      useCase, 
      priority, 
      category, 
      expectedBenefit 
    } = req.body;

    // Send email to admins
    const adminEmailResult = await sendFeatureRequestEmail({
      name,
      email,
      organization,
      featureTitle,
      description,
      useCase,
      priority,
      category,
      expectedBenefit,
    });

    // Send confirmation email to user
    const userEmailResult = await sendConfirmationEmail(email, name, 'feature');

    res.status(200).json({
      success: true,
      message: 'Your feature request has been submitted successfully. Thank you for your suggestion!',
      data: {
        adminEmailId: adminEmailResult.messageId,
        userEmailId: userEmailResult.messageId,
      },
    });

  } catch (error) {
    console.error('Error processing feature request:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error submitting your feature request. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get contact information endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      email: 'support@bvm-reports.edu',
      phone: '+91 1234 567890',
      address: 'BVM Engineering College, V.V. Nagar, Anand, Gujarat 388120',
      businessHours: 'Mon - Fri: 9AM - 6PM IST',
      supportChannels: [
        {
          type: 'email',
          label: 'Email Support',
          value: 'support@bvm-reports.edu',
          responseTime: '24 hours',
        },
        {
          type: 'phone',
          label: 'Phone Support',
          value: '+91 1234 567890',
          responseTime: 'Immediate',
          availability: 'Mon-Fri 9AM-6PM IST',
        },
        {
          type: 'chat',
          label: 'Live Chat',
          value: 'Available on website',
          responseTime: 'Real-time',
          availability: '24/7',
        },
      ],
      offices: [
        {
          name: 'Main Campus',
          address: 'BVM Engineering College, V.V. Nagar, Anand, Gujarat 388120',
          phone: '+91 1234 567890',
          email: 'main@bvm-reports.edu',
        },
        {
          name: 'Research Center',
          address: 'CVM University, V.V. Nagar, Anand, Gujarat 388120',
          phone: '+91 1234 567891',
          email: 'research@bvm-reports.edu',
        },
        {
          name: 'Innovation Hub',
          address: 'Vishvakarma Lekhan Institute, Anand, Gujarat',
          phone: '+91 1234 567892',
          email: 'innovation@bvm-reports.edu',
        },
      ],
    },
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Contact service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
