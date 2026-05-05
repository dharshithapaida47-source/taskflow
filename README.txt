TASKFLOW - TEAM TASK MANAGER
============================

A full-stack web app where teams create projects, assign tasks with file
attachments, and track progress in real time -- with role-based access for
admins and members.

Stack:   React 18 + Node.js + Express + MongoDB + JWT
Deploy:  Railway + MongoDB Atlas
License: ISC


PROJECT OVERVIEW
================

TaskFlow is a small but production-style team task manager. Admins create
projects, build teams, and hand out work -- including PDF or Word specs
uploaded straight to a task. Members see only what's assigned to them, work
through their kanban, and update task status as they go.

The app is intentionally beginner-friendly to read: a clean Express backend
with controllers/routes/models, a React frontend with hooks + context, and a
single design-token CSS file that powers both light and dark mode.


FEATURES
========

Authentication
--------------
- Sign up / log in with JWT
- Bcrypt-hashed passwords
- Role selector at login (Admin or Member); backend rejects mismatches
- 401 interceptor auto-redirects expired sessions

Projects & teams
----------------
- Admins create projects with name + description
- Add or remove team members per project
- Members see only their projects in "My Projects"
- Click a project -> see each member's task progress and completion %

Tasks
-----
- Create, edit, reassign, delete (admin)
- Work types: Frontend, Backend, Fullstack, Testing, Design
- Due date with time picker
- File attachments: PDF / Word / TXT / PNG / JPG, up to 10 MB
- Edit modal (admin only): change every field, replace or remove file
- Auto-add to project: assigning to a non-member silently adds them
- Three statuses: Pending -> In Progress -> Completed
- Overdue is automatic (derived from dueDate; no cron needed)

Dashboard
---------
- Stat cards: Pending, In Progress, Completed, Overdue
- Three-column kanban board grouped by status
- Filter by work type (chips)
- Click any task card -> detail modal with download button if there's a file
- Pagination (20 tasks per page)

Permission model
----------------
                            Admin       Member
View tasks                  All         Only their own
Create / delete tasks       Yes         No
Reassign tasks              Yes (auto-adds to project)
Replace / remove files      Yes         No
Update task STATUS          NO          YES (only their own)
Manage projects             Yes         No

Polish
------
- Dark / light mode (sliding toggle, localStorage, OS preference)
- Page-enter and stagger animations
- Modal-based task creation/editing with animated user picker
- Modern login/signup with animated brand panel + product preview

Security
--------
- helmet for HTTP security headers
- express-rate-limit:
    300 requests / 15 min globally
     10 requests / 15 min on /api/auth/* (brute-force defense)
- CORS whitelist via FRONTEND_URL env var
- Server-side validation on every endpoint
- File-type and size guards on uploads
- The protect middleware re-reads role from MongoDB on every request, so a
  JWT can never lie about role

Quality
-------
- 28 Jest unit tests on validators, pagination, response handler
- React error boundary
- useMemo + React.memo for fast re-renders


TECH STACK
==========

Frontend       React 18, React Router v6, Axios
Backend        Node.js, Express, Mongoose
Database       MongoDB
Auth           JWT, bcryptjs
File uploads   multer (disk storage, 10 MB limit)
Security       helmet, express-rate-limit, CORS whitelist
Tests          Jest
Styling        Plain CSS with custom properties


SETUP INSTRUCTIONS
==================

Prerequisites
-------------
- Node.js v18 or higher
- MongoDB on localhost:27017 (or any MongoDB connection string)
- npm

1. Clone the repo
   git clone https://github.com/paidadharshitha/Taskflow.git
   cd Taskflow

2. Start MongoDB
   On macOS (Homebrew):
     mongod --config /opt/homebrew/etc/mongod.conf
   On Linux/Windows: see https://www.mongodb.com/docs/manual/installation/

3. Set up the backend
   cd backend
   cp .env.example .env       # then edit .env
   npm install
   npm run dev                # http://localhost:5000

   .env keys:
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/team-task-manager
     JWT_SECRET=<long random string>
     NODE_ENV=development
     FRONTEND_URL=http://localhost:3000

   Tip: generate a strong JWT secret with
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

4. Set up the frontend (in a new terminal)
   cd frontend
   cp .env.example .env       # set REACT_APP_API_URL if needed
   npm install
   npm start                  # http://localhost:3000

5. Seed the demo admin (optional)
   cd backend
   node scripts/seedAdmin.js
   # creates/upgrades admin@example.com / Admin12345

6. Run the tests
   cd backend
   npm test                   # 28 tests, all passing


DEMO CREDENTIALS
================

After running scripts/seedAdmin.js:

  Role:     Admin
  Email:    admin@example.com
  Password: Admin12345

CHANGE THIS PASSWORD (or delete the seed script) BEFORE PRODUCTION.

To create a member account, use the Sign up flow at /signup -- every new
account starts as a Member by default.


API ENDPOINTS
=============

All endpoints (except /signup and /login) require:
  Authorization: Bearer <token>

Auth
----
  POST   /api/auth/signup            { name, email, password }
  POST   /api/auth/login             { email, password, role }
                                     (role must match the stored role)
  GET    /api/auth/me                current user

Users
-----
  GET    /api/users                  authenticated
  POST   /api/users                  admin -- creates a new user
  GET    /api/users/:id              authenticated
  PUT    /api/users/:id/promote      admin
  PUT    /api/users/:id/demote       admin

Projects
--------
  GET    /api/projects?page=1&limit=20         only projects you belong to
  POST   /api/projects                          admin
  GET    /api/projects/:id                      authenticated
  GET    /api/projects/:id/progress             per-member task progress
  PUT    /api/projects/:id                      project owner
  DELETE /api/projects/:id                      project owner (cascade-deletes
                                                tasks)
  POST   /api/projects/:id/members              project owner
  DELETE /api/projects/:id/members/:memberId    project owner

Tasks
-----
  GET    /api/tasks?page=1&limit=20&workType=frontend
                                     members get only assigned tasks;
                                     admins get all
  GET    /api/tasks/project/:projectId
  POST   /api/tasks                  admin -- multipart with optional
                                     `attachment` file
  PUT    /api/tasks/:id              admin or assignee
                                       members can only change status;
                                       admins can change anything EXCEPT
                                       status
                                     Multipart accepted for replacing the
                                     attachment, or send
                                     `removeAttachment: true` to clear it
  DELETE /api/tasks/:id              admin (also deletes file from disk)
  GET    /api/tasks/:id/attachment   admin or assignee
                                     streams the file with original filename


DEPLOYMENT (Railway)
====================

Railway needs a hosted MongoDB. Easiest free path: MongoDB Atlas (free M0
cluster). File uploads are stored on disk and won't survive a redeploy --
for real production, swap the storage layer to S3 / Cloudinary.

1. MongoDB Atlas
   - Create a database user
   - Network Access: allow 0.0.0.0/0
   - Copy the connection string

2. Push to GitHub
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main

3. Backend service on Railway
   - New Project -> Deploy from GitHub
   - Root Directory: backend
   - Start Command: node server.js
   - Env vars:
       MONGODB_URI=<atlas connection string>
       JWT_SECRET=<long random string>
       NODE_ENV=production
       PORT=5000
       FRONTEND_URL=<frontend service URL>
   - Generate domain

4. Frontend service on Railway
   - Root Directory: frontend
   - Build Command: npm install && npm run build
   - Start Command: npx serve -s build -l $PORT
   - Env var: REACT_APP_API_URL=<backend URL>/api
   - Generate domain

5. Update FRONTEND_URL on backend with actual frontend URL, redeploy

6. Seed admin via Railway shell:
   node scripts/seedAdmin.js
   Log in, then change the password.


PROJECT STRUCTURE
=================

Taskflow/
  backend/
    controllers/       auth, users, projects, tasks
    routes/            Express routers
    models/            User, Project, Task (Mongoose)
    middleware/        auth (JWT), upload (multer)
    utils/             validators, pagination, response helpers (+ tests)
    scripts/           seedAdmin.js
    uploads/           task attachment files (gitignored)
    server.js          Express app entrypoint
  frontend/
    src/
      pages/           Login, Signup, Dashboard, Projects
      components/      TopHeader, Sidebar, TaskItem, Modal,
                       TaskDetailModal, TaskEditModal, UserPicker,
                       ThemeToggle, AuthBrandPanel, Skeleton, Icons,
                       ErrorBoundary
      context/         AuthContext, ThemeContext
      styles/          theme.css (design tokens + dark mode)
      utils/           api.js (axios instance + endpoint functions)


LICENSE
=======

ISC -- see LICENSE file for details.
