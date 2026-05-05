const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Security headers (XSS, clickjacking, MIME sniffing, etc.)
app.use(helmet());

// CORS whitelist: read allowed origins from FRONTEND_URL (comma-separated for multiple)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / curl / server-to-server requests with no Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);

app.use(express.json());

// Global rate limit: 300 requests / 15 min / IP for any /api/* endpoint
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Strict limiter for auth: 10 attempts / 15 min / IP (blocks brute-force on login/signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Routes
    app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/projects', require('./routes/projectRoutes'));
    app.use('/api/tasks', require('./routes/taskRoutes'));

    // ----- Serve the React frontend in production -----
    // If frontend/build exists (i.e. the frontend has been built — done either
    // by `npm run build` locally or by the postinstall hook on Railway), the
    // backend also serves the SPA. Single URL hosts both API and UI.
    const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
    const frontendIndex = path.join(frontendBuildPath, 'index.html');

    if (fs.existsSync(frontendIndex)) {
      app.use(express.static(frontendBuildPath));

      // Catch-all for client-side routes (anything NOT starting with /api)
      app.get(/^\/(?!api\/).*/, (req, res) => {
        res.sendFile(frontendIndex);
      });

      console.log('Serving React build from', frontendBuildPath);
    } else {
      // No frontend build available — keep the JSON landing page so /api/health
      // checks still work cleanly.
      app.get('/', (req, res) => {
        res.json({ message: 'Team Task Manager API' });
      });
      console.log('No frontend build found; running in API-only mode.');
    }

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ success: false, message: 'Something went wrong!' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Backend will not start until MongoDB is available.');
    process.exit(1);
  });
