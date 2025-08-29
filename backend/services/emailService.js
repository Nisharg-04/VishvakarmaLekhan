import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });
};

// Admin email addresses
const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL_1 || 'admin1@bvm-reports.edu',
  process.env.ADMIN_EMAIL_2 || 'admin2@bvm-reports.edu',
  process.env.ADMIN_EMAIL_3 || 'support@bvm-reports.edu',
];

// Send contact us email
export const sendContactEmail = async (contactData) => {
  const { name, email, organization, subject, message, priority } = contactData;
  
  const transporter = createTransporter();
  
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    urgent: '#EF4444'
  };
  
  const priorityColor = priorityColors[priority] || '#6B7280';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; background-color: ${priorityColor}; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6; }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #6B7280; }
        .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
        .footer { text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Contact Form Submission</h1>
          <p>Someone has reached out through the website contact form</p>
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="priority-badge">Priority: ${priority.toUpperCase()}</span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">👤 Name</div>
              <div class="info-value">${name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📧 Email</div>
              <div class="info-value">${email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">🏢 Organization</div>
              <div class="info-value">${organization || 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📝 Subject</div>
              <div class="info-value">${subject}</div>
            </div>
          </div>
          
          <div class="message-box">
            <div class="info-label">💬 Message</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div class="footer">
            <p>📅 Received on ${new Date().toLocaleString()}</p>
            <p>This email was automatically generated from the BVM Report Generator contact form.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAILS,
    subject: `[${priority.toUpperCase()}] Contact Form: ${subject}`,
    html: htmlContent,
    replyTo: email,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

// Send feature request email
export const sendFeatureRequestEmail = async (featureData) => {
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
  } = featureData;
  
  const transporter = createTransporter();
  
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444'
  };
  
  const categoryColors = {
    general: '#6B7280',
    ai: '#8B5CF6',
    ui: '#3B82F6',
    export: '#10B981',
    collaboration: '#F59E0B',
    integration: '#F97316',
    security: '#EF4444',
    performance: '#06B6D4'
  };
  
  const priorityColor = priorityColors[priority] || '#6B7280';
  const categoryColor = categoryColors[category] || '#6B7280';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #F97316); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; margin: 0 5px; }
        .priority-badge { background-color: ${priorityColor}; }
        .category-badge { background-color: ${categoryColor}; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B; }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #6B7280; }
        .section-box { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #8B5CF6; }
        .footer { text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💡 New Feature Request</h1>
          <h2>${featureTitle}</h2>
          <p>A user has submitted a new feature request</p>
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="badge priority-badge">Priority: ${priority.toUpperCase()}</span>
            <span class="badge category-badge">Category: ${category.toUpperCase()}</span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">👤 Submitted by</div>
              <div class="info-value">${name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📧 Email</div>
              <div class="info-value">${email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">🏢 Organization</div>
              <div class="info-value">${organization || 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">📅 Submitted</div>
              <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="section-box">
            <div class="info-label">📝 Feature Description</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${description}</div>
          </div>
          
          <div class="section-box">
            <div class="info-label">🎯 Use Case</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${useCase}</div>
          </div>
          
          ${expectedBenefit ? `
          <div class="section-box">
            <div class="info-label">🎁 Expected Benefit</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${expectedBenefit}</div>
          </div>
          ` : ''}
          
          <div class="footer">
            <p>📅 Received on ${new Date().toLocaleString()}</p>
            <p>This email was automatically generated from the BVM Report Generator feature request form.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAILS,
    subject: `[FEATURE REQUEST] [${priority.toUpperCase()}] ${featureTitle}`,
    html: htmlContent,
    replyTo: email,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Feature request email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending feature request email:', error);
    throw error;
  }
};

// Send confirmation email to user
export const sendConfirmationEmail = async (userEmail, userName, type = 'contact') => {
  const transporter = createTransporter();
  
  const isFeatureRequest = type === 'feature';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isFeatureRequest ? '💡' : '✅'} Thank You, ${userName}!</h1>
          <p>${isFeatureRequest ? 'Your feature request has been received' : 'Your message has been received'}</p>
        </div>
        <div class="content">
          <div class="message-box">
            <p>Hi ${userName},</p>
            <p>Thank you for ${isFeatureRequest ? 'submitting your feature request' : 'contacting us'}! We've received your ${isFeatureRequest ? 'suggestion' : 'message'} and our team will review it carefully.</p>
            
            ${isFeatureRequest ? `
            <p>🚀 <strong>What happens next?</strong></p>
            <ul>
              <li>Our product team will review your feature request</li>
              <li>We'll evaluate its feasibility and potential impact</li>
              <li>If approved, it will be added to our development roadmap</li>
              <li>You'll receive updates on the progress via email</li>
            </ul>
            ` : `
            <p>📞 <strong>What happens next?</strong></p>
            <ul>
              <li>Our support team will review your message</li>
              <li>We'll respond within 24 hours during business days</li>
              <li>For urgent matters, we may contact you directly</li>
            </ul>
            `}
            
            <p>In the meantime, feel free to explore our platform and check out our latest features!</p>
            
            <div style="text-align: center;">
              <a href="https://bvm-reports.edu" class="cta-button">Visit Our Platform</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The BVM Report Generator Team</p>
            <p>📧 If you have any questions, reply to this email or contact us at support@bvm-reports.edu</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: isFeatureRequest 
      ? '💡 Feature Request Received - Thank You!' 
      : '✅ Message Received - Thank You!',
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

export default {
  sendContactEmail,
  sendFeatureRequestEmail,
  sendConfirmationEmail
};
