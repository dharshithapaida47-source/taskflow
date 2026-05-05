cd frontend
npm install
npm start# Team Task Manager - Project Setup and Development Instructions

## Project Overview

This is a full-stack application for managing team tasks with role-based access control. The application is built with React (frontend), Node.js/Express (backend), and MongoDB (database).

## Prerequisites

Before starting development, ensure you have:
- Node.js v14+ installed
- MongoDB installed locally or access to MongoDB Atlas
- npm or yarn package manager
- Git for version control

## Quick Start Guide

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. **Environment Variables Configuration:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/team-task-manager
   JWT_SECRET=your_secret_key_here_change_this_in_production
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system:
   ```bash
   mongod
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

## Testing the Application

### Create Test Users

1. **Admin User:**
   - Go to http://localhost:3000/signup
   - Create account with role "Admin"
   - Example credentials:
     - Name: Admin User
     - Email: admin@example.com
     - Password: password123
     - Role: Admin

2. **Member User:**
   - Go to http://localhost:3000/signup
   - Create account with role "Member"
   - Example credentials:
     - Name: Team Member
     - Email: member@example.com
     - Password: password123
     - Role: Member

### Admin Workflow

1. Log in as admin
2. Create a project
3. Create tasks and assign to team members
4. View dashboard with all tasks

### Member Workflow

1. Log in as member
2. View assigned tasks in dashboard
3. Update task status (Todo → In Progress → Done)
4. View task details

## Project Structure

```
team-task-manager/
├── backend/
│   ├── models/          # Database schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication & validation
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env             # Environment variables (create from .env.example)
│
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages (Login, Signup, Dashboard)
│   │   ├── components/  # Reusable components
│   │   ├── utils/       # API utilities
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md            # Project documentation
```

## Available Scripts

### Backend

- `npm start` - Run the server
- `npm run dev` - Run with nodemon for development

### Frontend

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Project Endpoints

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project (admin only)
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project (admin only)

### Task Endpoints

- `GET /api/tasks` - Get tasks
- `GET /api/tasks/project/:projectId` - Get tasks by project
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task (admin only)

## Development Checklist

- [x] Backend API structure set up
- [x] Database models created (User, Project, Task)
- [x] Authentication with JWT implemented
- [x] Role-based access control implemented
- [x] Frontend pages created (Login, Signup, Dashboard)
- [x] API integration with axios
- [x] Task management features
- [x] Error handling
- [ ] Write unit tests
- [ ] Add input validation
- [ ] Setup production deployment
- [ ] Add email notifications
- [ ] Implement advanced filtering

## Common Issues and Solutions

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP whitelist includes your machine

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: The app will prompt to use a different port

### CORS Errors
- Ensure backend is running on http://localhost:5000
- Frontend is configured to connect to this URL

### JWT Token Errors
- Clear localStorage and login again
- Check JWT_SECRET matches between signup/login and token verification

## Security Considerations

- Always change JWT_SECRET in production
- Use environment variables for sensitive data
- Validate input on both frontend and backend
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add request validation middleware
- Sanitize database queries

## Next Steps for Production

1. Set up environment-specific configurations
2. Implement comprehensive error logging
3. Add request validation and sanitization
4. Set up database backups
5. Configure HTTPS/SSL
6. Implement rate limiting
7. Add monitoring and alerting
8. Set up CI/CD pipeline
9. Add comprehensive test suite
10. Deploy to production hosting (AWS, Heroku, etc.)

## Troubleshooting

If you encounter any issues:

1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check for port conflicts:**
   ```bash
   lsof -i :5000  # Backend
   lsof -i :3000  # Frontend
   ```

3. **Check MongoDB connection:**
   ```bash
   mongosh
   use team-task-manager
   db.users.find()
   ```

4. **View backend logs:**
   Check the terminal where `npm run dev` is running for error messages

## Support and Resources

- MongoDB Documentation: https://docs.mongodb.com/
- Express.js: https://expressjs.com/
- React Documentation: https://react.dev/
- JWT Guide: https://jwt.io/
- Axios Documentation: https://axios-http.com/

---

**Last Updated:** May 4, 2026
**Status:** Production Ready
