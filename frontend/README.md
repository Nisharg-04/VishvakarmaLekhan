# BVM Report Generator - Full Stack Application

A comprehensive report generation system for Birla Vishvakarma Mahavidyalaya Engineering College, built with React (frontend) and Node.js/Express/MongoDB (backend).

## 🚀 Features

- **Report Creation**: Create detailed event reports with rich content blocks
- **Content Management**: Add text, images, quotes, and achievements
- **File Uploads**: Support for attendance sheets and miscellaneous files
- **Report Generation**: AI-powered content generation
- **History Management**: View, edit, and delete saved reports
- **Dark Mode**: Built-in theme switching
- **Responsive Design**: Works seamlessly across devices

## 📁 Project Structure

```
BVM REPORT GEN/
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads directory
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── store/              # Zustand state management
│   ├── utils/              # Utility functions
│   └── ...
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

## 🛠 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- npm or yarn package manager

## ⚡ Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Setup

**Backend Environment (.env in backend folder):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bvm-report-generator
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend Environment (.env in root folder):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### 3. Database Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. The application will automatically create the database and collections

**Option 2: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env` file

### 4. Start the Application

**Development Mode:**

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser to:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 📡 API Endpoints

### Reports
- `GET /api/reports` - Get all reports (paginated)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/generate` - Generate report content

### File Uploads
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `POST /api/upload/attendance` - Upload attendance sheet
- `DELETE /api/upload/:filename` - Delete uploaded file

### Health Check
- `GET /api/health` - API health check

## 🗄 Database Schema

### EventReport Model
```javascript
{
  title: String,
  tagline: String,
  selectedLogos: [String],
  startDate: Date,
  endDate: Date,
  venue: String,
  eventType: String,
  organizedBy: String,
  institute: String,
  academicYear: String,
  semester: String,
  targetAudience: String,
  participantCount: Number,
  facultyCoordinators: [Object],
  studentCoordinators: [Object],
  chiefGuest: Object,
  contentBlocks: [Object],
  attendanceSheet: String,
  generatedContent: String,
  status: String, // 'draft' | 'generated'
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Frontend Configuration
- API URL configuration in `.env`
- Theme management via Zustand store
- Route configuration in `App.tsx`

### Backend Configuration
- CORS settings for frontend integration
- File upload limits and allowed types
- Rate limiting configuration
- Database connection settings

## 📱 Key Features Explained

### 1. Report Creation
- Dynamic form with multiple sections
- Real-time validation
- Auto-save functionality
- Logo selection system

### 2. Content Blocks
- Text blocks for descriptions
- Image blocks with upload support
- Quote blocks for testimonials
- Achievement blocks for highlights

### 3. File Management
- Secure file uploads
- Multiple file format support
- File size limitations
- Automatic cleanup

### 4. State Management
- Zustand for client state
- Real-time API integration
- Optimistic updates
- Error handling

## 🚀 Deployment

### Frontend (Vite/React)
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend (Node.js/Express)
1. Set environment variables for production
2. Deploy to hosting service (Heroku, Railway, DigitalOcean, etc.)
3. Ensure MongoDB is accessible from production environment

### Environment Variables for Production
Update the `.env` files with production URLs and secure secrets.

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Check if MongoDB is running
   - Verify connection string
   - Check network/firewall settings

2. **CORS Errors**
   - Ensure frontend URL is correctly set in backend CORS configuration
   - Check if both servers are running

3. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Ensure file types are allowed

4. **API Connection Issues**
   - Verify API URL in frontend `.env`
   - Check if backend server is running
   - Look for network/proxy issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React and Vite teams for the amazing development experience
- MongoDB for the flexible database solution
- Tailwind CSS for the utility-first CSS framework
- All the open-source libraries that made this project possible
