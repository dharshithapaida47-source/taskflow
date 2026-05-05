# TaskFlow — Team Task Manager

> A full-stack web app where teams create projects, assign tasks with file attachments, and track progress in real time — with role-based access for admins and members.

**Stack:** React 18 · Node.js · Express · MongoDB · JWT
**Deploy:** Railway + MongoDB Atlas
**License:** ISC

---

## 📖 Project overview

TaskFlow is a small but production-style team task manager. **Admins** create projects, build teams, and hand out work — including PDF or Word specs uploaded straight to a task. **Members** see only what's assigned to them, work through their kanban, and update task status as they go.

The app is intentionally beginner-friendly to read: a clean Express backend with controllers/routes/models, a React frontend with hooks + context, and a single design-token CSS file that powers both light and dark mode.

---

## ✨ Features

### 🔐 Authentication
- Sign up / log in with JWT
- Bcrypt-hashed passwords (10 rounds)
- **Role selector at login** — pick *Admin* or *Member*; the backend rejects mismatches
- Auto-redirect to login when a token expires (401 interceptor)

### 📁 Projects & teams
- Admins create projects with a name + description
- Add or remove team members per project
- Members see only their own projects in **My Projects**
- Click any project → modal shows each member's **task progress** (pending / in-progress / completed / overdue) with an animated completion-percentage bar

### ✅ Tasks
- Create, edit, reassign, delete (admin)
- **Work types** — Frontend, Backend, Fullstack, Testing, Design (color-coded)
- **Due date with time** picker
- **File attachments** — admins can upload a PDF / Word / TXT / PNG / JPG (≤ 10 MB) when creating or editing a task; the assignee can download it later from the task detail view
- **Edit modal (admin only)** — change every field, replace the file, remove the file
- **Auto-add to project** — assigning to a user outside the team silently adds them
- Three statuses: **Pending → In Progress → Completed**
- **Overdue is automatic** — derived from `dueDate < now && status !== completed`, no cron needed

### 📊 Dashboard
- Stat cards: Pending · In Progress · Completed · Overdue
- Three-column **kanban board** grouped by status
- **Filter by work type** (chips above the kanban)
- Click any task card → detail modal (full description, all metadata, **Download** button if there's a file)
- Pagination — 20 tasks per page

### 🛡 Permission model

| Action | Admin | Member |
|---|---|---|
| View tasks | All tasks | Only their own |
| Create / delete tasks | ✅ | ❌ |
| Reassign tasks | ✅ (auto-adds new user to project) | ❌ |
| Replace / remove attachments | ✅ | ❌ |
| Update task **status** | ❌ (blocked — only the assignee can) | ✅ |
| Create / manage projects | ✅ | ❌ |

### 🎨 Polish
- Dark / light mode with a sliding toggle (persists in `localStorage`, follows OS preference, respects `prefers-reduced-motion`)
- Subtle page-enter and stagger animations
- Modal-based task creation/editing with an animated user picker
- Modern login/signup with an animated brand panel + product-preview card

### 🔒 Security
- `helmet` for HTTP security headers
- `express-rate-limit`: 300 req / 15 min global, **10 req / 15 min on `/api/auth/*`** (brute-force defense)
- CORS whitelist via `FRONTEND_URL` env var
- Server-side validation on every endpoint
- File-type and size guards on uploads
- The `protect` middleware re-reads the user's role from MongoDB on every request, so a JWT can never lie about role (resilient to demote/promote)

### 🧪 Quality
- 28 Jest unit tests on validators, pagination, response handler
- React error boundary so a component crash never blanks the app
- `useMemo` + `React.memo` to keep re-renders tight

---

## 🛠 Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, React Router v6, Axios |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **File uploads** | multer (disk storage, 10 MB limit) |
| **Security** | helmet, express-rate-limit, CORS whitelist |
| **Tests** | Jest |
| **Styling** | Plain CSS with custom properties (no UI library) |

---

## 🚀 Setup instructions

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running on `localhost:27017` (or any MongoDB connection string)
- **npm** (comes with Node.js)

### 1. Clone the repo

```bash
git clone https://github.com/paidadharshitha/Taskflow.git
cd Taskflow
```

### 2. Start MongoDB

If you have MongoDB installed via Homebrew on macOS:

```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

Or on Linux/Windows, follow the [official MongoDB install guide](https://www.mongodb.com/docs/manual/installation/).

### 3. Set up the backend

```bash
cd backend
cp .env.example .env       # then edit .env
npm install
npm run dev                # http://localhost:5000
```

`.env` keys:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=<a long random string — change this!>
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> 💡 To generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 4. Set up the frontend

In a new terminal:

```bash
cd frontend
cp .env.example .env       # set REACT_APP_API_URL if needed
npm install
npm start                  # http://localhost:3000
```

### 5. Seed the demo admin (optional)

```bash
cd backend
node scripts/seedAdmin.js
```

This creates (or resets) the admin account `admin@example.com / Admin12345`. Re-runnable any time.

### 6. Run the tests

```bash
cd backend
npm test
```

You should see **28 tests passing**.

---

## 🔑 Demo credentials

After running `node scripts/seedAdmin.js`:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `Admin12345` |

> ⚠️ Change this password (or delete the seed script entirely) before shipping to production. Hardcoded credentials are dev-only.

To create a member account, just use the **Sign up** flow at `/signup` — every new account starts as a **Member** by default.

---

## 📡 API endpoints

All endpoints (except `/signup` and `/login`) require an `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` | Creates a member account |
| POST | `/api/auth/login` | `{ email, password, role }` | `role` (admin/member) must match the stored role |
| GET | `/api/auth/me` | – | Current user |

### Users

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/users` | Authenticated | Used for assignment pickers |
| POST | `/api/users` | Admin | Admin creates a new user (`{ name, email, password, role }`) |
| GET | `/api/users/:id` | Authenticated | Single user |
| PUT | `/api/users/:id/promote` | Admin | Promote member → admin |
| PUT | `/api/users/:id/demote` | Admin | Demote admin → member |

### Projects

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/projects?page=1&limit=20` | Authenticated | Returns only projects the caller is part of (admin or member) |
| POST | `/api/projects` | Admin | `{ name, description }` |
| GET | `/api/projects/:id` | Authenticated | Single project with populated members |
| GET | `/api/projects/:id/progress` | Authenticated | Per-member task counts + completion percentage |
| PUT | `/api/projects/:id` | Project owner | Update name / description |
| DELETE | `/api/projects/:id` | Project owner | Cascades — also deletes all tasks |
| POST | `/api/projects/:id/members` | Project owner | `{ memberId }` |
| DELETE | `/api/projects/:id/members/:memberId` | Project owner | Remove a member |

### Tasks

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/api/tasks?page=1&limit=20&workType=frontend` | Authenticated | Members get only assigned tasks; admins get all. `workType` filter is optional |
| GET | `/api/tasks/project/:projectId` | Authenticated | All tasks in a project |
| POST | `/api/tasks` | Admin | Multipart: fields + optional `attachment` file |
| PUT | `/api/tasks/:id` | Admin OR assignee | Members can only change `status`. Admins can change anything **except** `status`. Multipart accepted for replacing the attachment, or `removeAttachment: true` to clear it |
| DELETE | `/api/tasks/:id` | Admin | Also deletes the file from disk |
| GET | `/api/tasks/:id/attachment` | Admin OR assignee | Streams the file with original filename |

---

## 🌐 Deployment (Railway)

> **Heads up:** Railway needs a hosted MongoDB. The easiest free path is **MongoDB Atlas** (free M0 cluster). File uploads are stored on disk and won't survive a redeploy — for real production, swap the storage layer to S3 / Cloudinary.

### Step 1 — MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. **Database Access** → add a user (username + password). Save these.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — required for Railway).
4. **Connect → Drivers** → copy the connection string.

### Step 2 — Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 3 — Backend service on Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Settings → **Root Directory**: `backend`
3. Settings → **Start Command**: `node server.js`
4. Variables → add:
   ```
   MONGODB_URI=<your Atlas connection string>
   JWT_SECRET=<long random string>
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=<frontend Railway URL — set after step 4>
   ```
5. Settings → **Networking** → **Generate Domain**.

### Step 4 — Frontend service on Railway

1. Settings → **Root Directory**: `frontend`
2. Build Command: `npm install && npm run build`
3. Start Command: `npx serve -s build -l $PORT` *(add `serve` to dependencies first)*
4. Variables → `REACT_APP_API_URL=<backend URL>/api`
5. Generate domain.

### Step 5 — Update CORS + seed admin

1. Update `FRONTEND_URL` on the backend service with the actual frontend URL → redeploy.
2. Open the Railway shell on the backend → `node scripts/seedAdmin.js`.
3. Log in with `admin@example.com / Admin12345` and **change the password immediately**.

---

## 📁 Project structure

```
Taskflow/
├── backend/
│   ├── controllers/        # auth, users, projects, tasks
│   ├── routes/             # Express routers
│   ├── models/             # User, Project, Task (Mongoose)
│   ├── middleware/         # auth (JWT), upload (multer)
│   ├── utils/              # validators, pagination, response helpers (+ tests)
│   ├── scripts/            # seedAdmin.js
│   ├── uploads/            # task attachment files (gitignored)
│   └── server.js           # Express app entrypoint
└── frontend/
    └── src/
        ├── pages/          # Login, Signup, Dashboard, Projects
        ├── components/     # TopHeader, Sidebar, TaskItem, Modal,
        │                   # TaskDetailModal, TaskEditModal, UserPicker,
        │                   # ThemeToggle, AuthBrandPanel, Skeleton, Icons,
        │                   # ErrorBoundary
        ├── context/        # AuthContext, ThemeContext
        ├── styles/         # theme.css (design tokens + dark mode)
        └── utils/          # api.js (axios instance + endpoint functions)
```

---

## 📜 License

ISC — see [LICENSE](LICENSE).
