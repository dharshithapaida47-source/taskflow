# TaskFlow — Team Task Manager

A full-stack web app where teams can create projects, assign tasks, and track progress with role-based access control (Admin / Member).

Built with **React + Node.js + Express + MongoDB**, deployable on Railway + MongoDB Atlas.

---

## ✨ Features

### Authentication
- Sign up / log in with JWT
- Bcrypt password hashing
- Auto-redirect to login when the token expires (401 interceptor)

### Projects & Teams
- Admins create projects with name + description
- Add or remove team members per project
- Projects own their tasks (cascade delete)

### Tasks
- Create, assign, set due date
- Status workflow: **To Do → In Progress → Done**
- Members can update the status of tasks assigned to them
- Admins can create / reassign / delete any task
- **Overdue indicator** — tasks past their due date that aren't `done` are highlighted

### Dashboard
- Stats: Overdue, To Do, In Progress, Done
- Tasks grouped by status in three columns
- Pagination (20 tasks/page)
- Members see only their own tasks; admins see everything

### Security
- `helmet` for HTTP security headers
- `express-rate-limit`: 300 req / 15 min global, **10 req / 15 min on `/api/auth/*`** (brute-force defense)
- CORS whitelist via `FRONTEND_URL` env var
- Server-side validation on every endpoint
- Password minimum length enforced

### Polish
- **Dark / light mode** with a sliding toggle in the top bar (persists in `localStorage`, falls back to OS preference, respects `prefers-reduced-motion`)
- Subtle page-enter and stagger animations
- Modal-based "New Task" flow with description, calendar date picker, and clickable team-member picker

### Quality
- Pure-function unit tests (`npm test` — 28 tests)
- React error boundary so a component crash never blanks the page
- Memoized components and `useMemo` filtering for fast re-renders

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Auth | JWT + bcryptjs |
| Security | helmet, express-rate-limit, CORS whitelist |
| Tests | Jest |

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── controllers/       # Request handlers (auth, projects, tasks, users)
│   ├── routes/            # Express routers
│   ├── models/            # Mongoose schemas (User, Project, Task)
│   ├── middleware/        # JWT auth + role guard
│   ├── utils/             # validators, pagination, response helpers (+ tests)
│   ├── scripts/seedAdmin.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/         # Login, Signup, Dashboard, Projects
│       ├── components/    # TopHeader, Sidebar, TaskItem, TaskList,
│       │                  # Modal, UserPicker, ThemeToggle, Icons,
│       │                  # AuthBrandPanel, Skeleton, ErrorBoundary
│       ├── context/       # AuthContext, ThemeContext
│       ├── styles/        # theme.css (design tokens + dark mode)
│       └── utils/api.js
└── README.md
```

---

## 🚀 Run locally

### Prereqs
- Node.js 18+
- MongoDB running on `localhost:27017` (or any MongoDB URI)

### 1. Backend
```bash
cd backend
cp .env.example .env          # then edit .env with your values
npm install
npm run dev                   # http://localhost:5000
```

`.env` keys:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=replace_me_with_a_long_random_string
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env          # set REACT_APP_API_URL
npm install
npm start                     # http://localhost:3000
```

### 3. (Optional) Seed an admin
```bash
cd backend
node scripts/seedAdmin.js     # creates/upgrades admin@example.com / Admin12345
```

### 4. Run tests
```bash
cd backend
npm test                      # 28 unit tests
```

---

## 🌐 Deploying to Railway

> **Heads up:** Railway needs a hosted MongoDB. The easiest free path is **MongoDB Atlas** (free M0 cluster).

### Step 1 — MongoDB Atlas
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. **Database Access** → add a user (username + password). Save these.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — required for Railway).
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/team-task-manager?retryWrites=true&w=majority
   ```

### Step 2 — Push code to GitHub
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 3 — Deploy backend on Railway
1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick your repo.
2. Railway will detect both `backend/` and `frontend/`. Create **two services**: one for each.
3. For the **backend service**:
   - Settings → **Root Directory**: `backend`
   - Settings → **Start Command**: `node server.js`
   - Variables tab → add:
     ```
     MONGODB_URI=<your Atlas connection string>
     JWT_SECRET=<long random string>
     NODE_ENV=production
     PORT=5000
     FRONTEND_URL=<the Railway URL of the frontend service, e.g. https://xxx.up.railway.app>
     ```
   - Settings → **Networking** → **Generate Domain**. Note this URL.

### Step 4 — Deploy frontend on Railway
1. For the **frontend service**:
   - Settings → **Root Directory**: `frontend`
   - Settings → **Build Command**: `npm install && npm run build`
   - Settings → **Start Command**: `npx serve -s build -l $PORT` *(install `serve` via `npm install --save serve` first, or use Railway's static-site hosting)*
   - Variables tab → add:
     ```
     REACT_APP_API_URL=<backend Railway URL>/api
     ```
   - Settings → **Networking** → **Generate Domain**.

### Step 5 — Update CORS
Go back to the backend service and set `FRONTEND_URL` to the actual frontend Railway URL, then redeploy.

### Step 6 — Seed the admin
On the backend service: open the Railway shell and run:
```bash
node scripts/seedAdmin.js
```
Now log in at the frontend URL with `admin@example.com` / `Admin12345` and **change the password immediately**.

---

## 🔑 Default admin (local only)

After running `node scripts/seedAdmin.js`:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin12345` | admin |

⚠️ Change this in production — or delete the script entirely.

---

## 📡 API Reference

All endpoints (except signup/login) require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| GET | `/api/auth/me` | Current user |

### Users
| Method | Path | Access |
|---|---|---|
| GET | `/api/users` | Authenticated |
| PUT | `/api/users/:id/promote` | Admin |
| PUT | `/api/users/:id/demote` | Admin |

### Projects
| Method | Path | Access |
|---|---|---|
| GET | `/api/projects?page=1&limit=20` | Authenticated |
| POST | `/api/projects` | Admin |
| GET | `/api/projects/:id` | Authenticated |
| PUT | `/api/projects/:id` | Project owner |
| DELETE | `/api/projects/:id` | Project owner — cascades to tasks |
| POST | `/api/projects/:id/members` | Project owner |
| DELETE | `/api/projects/:id/members/:memberId` | Project owner |

### Tasks
| Method | Path | Access |
|---|---|---|
| GET | `/api/tasks?page=1&limit=20` | Members see assigned only; admins see all |
| GET | `/api/tasks/project/:projectId` | Authenticated |
| POST | `/api/tasks` | Admin |
| PUT | `/api/tasks/:id` | Admin or assignee (assignee can only change status) |
| DELETE | `/api/tasks/:id` | Admin |

---

## 🧪 Testing

```bash
cd backend && npm test
```

Currently 28 tests covering validators, pagination, and the response handler. Add more by dropping `*.test.js` files anywhere under `backend/`.

---

## 📜 License

ISC
