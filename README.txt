TASKFLOW - TEAM TASK MANAGER
============================

A full-stack web app where teams create projects, assign tasks, and track
progress with role-based access control (Admin / Member).

Stack: React 18 + Node.js/Express + MongoDB + JWT.


FEATURES
--------

Authentication
  - Sign up / log in with JWT, bcrypt-hashed passwords
  - 401 interceptor auto-redirects expired sessions

Projects & Teams
  - Admins create projects with name + description
  - Add/remove team members per project
  - Cascade-delete tasks when a project is deleted

Tasks
  - Create, assign, set due date
  - Status workflow: To Do -> In Progress -> Done
  - Members can update the status of tasks assigned to them
  - Admins can create / reassign / delete any task
  - OVERDUE indicator for tasks past their due date that are not Done

Dashboard
  - Stats: Overdue, To Do, In Progress, Done
  - Three-column task board grouped by status
  - Pagination (20 tasks/page)
  - Members see only their tasks; admins see everything

Security
  - helmet for HTTP security headers
  - express-rate-limit: 300 req / 15 min global
                        10 req / 15 min on /api/auth/* (brute-force defense)
  - CORS whitelist via FRONTEND_URL env var
  - Server-side validation on every endpoint

Polish
  - Dark / light mode with a sliding toggle (persists in localStorage,
    falls back to OS preference, respects prefers-reduced-motion)
  - Subtle page-enter and stagger animations
  - Modal "New Task" flow with description, calendar date picker, and
    clickable team-member picker

Quality
  - 28 Jest unit tests on validators, pagination, response handler
  - React error boundary
  - Memoized components and useMemo filtering


PROJECT STRUCTURE
-----------------

task-manager/
  backend/
    controllers/     auth, projects, tasks, users
    routes/          Express routers
    models/          User, Project, Task (Mongoose)
    middleware/      JWT auth + role guard
    utils/           validators, pagination, response helpers (+ tests)
    scripts/         seedAdmin.js
    server.js
  frontend/
    src/
      pages/         Login, Signup, Dashboard, Projects
      components/    TopHeader, Sidebar, TaskItem, TaskList,
                     Modal, UserPicker, ThemeToggle, Icons,
                     AuthBrandPanel, Skeleton, ErrorBoundary
      context/       AuthContext, ThemeContext
      styles/        theme.css (design tokens + dark mode)
      utils/         api.js
  README.md
  README.txt


RUNNING LOCALLY
---------------

Prereqs: Node.js 18+, MongoDB on localhost:27017

1. Backend
   cd backend
   cp .env.example .env
   npm install
   npm run dev          # http://localhost:5000

   .env keys:
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/team-task-manager
     JWT_SECRET=<long random string>
     NODE_ENV=development
     FRONTEND_URL=http://localhost:3000

2. Frontend
   cd frontend
   cp .env.example .env
   npm install
   npm start            # http://localhost:3000

3. Seed an admin (optional)
   cd backend
   node scripts/seedAdmin.js
   # Creates/upgrades admin@example.com / Admin12345

4. Run tests
   cd backend
   npm test


DEPLOYING TO RAILWAY
--------------------

1. MongoDB Atlas (free M0 cluster)
   - Create a database user
   - Network Access: allow 0.0.0.0/0
   - Copy the connection string

2. Push code to GitHub
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
   Log in, change password.


DEFAULT ADMIN (local only)
--------------------------

After running scripts/seedAdmin.js:
  Email:    admin@example.com
  Password: Admin12345

CHANGE THIS IN PRODUCTION.


API REFERENCE
-------------

All endpoints (except signup/login) require:
  Authorization: Bearer <token>

Auth
  POST   /api/auth/signup       { name, email, password }
  POST   /api/auth/login        { email, password }
  GET    /api/auth/me           current user

Users
  GET    /api/users
  PUT    /api/users/:id/promote     (admin)
  PUT    /api/users/:id/demote      (admin)

Projects
  GET    /api/projects?page=1&limit=20
  POST   /api/projects                    (admin)
  GET    /api/projects/:id
  PUT    /api/projects/:id                (project owner)
  DELETE /api/projects/:id                (project owner; cascades to tasks)
  POST   /api/projects/:id/members        (project owner)
  DELETE /api/projects/:id/members/:memberId   (project owner)

Tasks
  GET    /api/tasks?page=1&limit=20       (members: assigned only; admins: all)
  GET    /api/tasks/project/:projectId
  POST   /api/tasks                        (admin)
  PUT    /api/tasks/:id                    (admin or assignee for status)
  DELETE /api/tasks/:id                    (admin)
