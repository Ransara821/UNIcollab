const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🎓 UNIcollab API Gateway is running!',
    services: {
      auth:       process.env.AUTH_SERVICE_URL,
      kuppiClass: process.env.VACANCY_SERVICE_URL,
      resource:   process.env.RESOURCE_SERVICE_URL,
      studyGroup: process.env.STUDY_GROUP_SERVICE_URL,
      quiz:       process.env.QUIZ_SERVICE_URL,
    }
  });
});

// Health check for all services
app.get('/health', (req, res) => {
  res.json({
    gateway: '✅ Running',
    port: process.env.PORT || 5000,
    services: {
      'auth-service':           `${process.env.AUTH_SERVICE_URL}/api/auth`,
      'kuppi-class-service':    `${process.env.VACANCY_SERVICE_URL}/api/kuppi-class`,
      'resource-sharing-service': `${process.env.RESOURCE_SERVICE_URL}/api/resources`,
      'study-group-service':        `${process.env.STUDY_GROUP_SERVICE_URL}/api/study-groups`,
      'quiz-service':               `${process.env.QUIZ_SERVICE_URL}/api/quizzes`,
    }
  });
});

// ── Route Proxies ──────────────────────────────────────

// Auth Service → http://localhost:5001
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL + '/api/auth',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Auth service unavailable' });
    }
  }
}));

// Kuppi Class Service → http://localhost:5002
app.use('/api/kuppi-class', createProxyMiddleware({
  target: process.env.VACANCY_SERVICE_URL + '/api/kuppi-class',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Kuppi class service unavailable' });
    }
  }
}));

app.use('/api/enrollments', createProxyMiddleware({
  target: process.env.VACANCY_SERVICE_URL + '/api/enrollments',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Kuppi class service unavailable' });
    }
  }
}));

// Resource Sharing Service → http://localhost:5003
app.use('/api/resources', createProxyMiddleware({
  target: process.env.RESOURCE_SERVICE_URL + '/api/resources',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Resource sharing service unavailable' });
    }
  }
}));

// Study Group Service → http://localhost:5004
app.use('/api/study-groups', createProxyMiddleware({
  target: process.env.STUDY_GROUP_SERVICE_URL + '/api/study-groups',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Study group service unavailable' });
    }
  }
}));

// Quiz Service → http://localhost:5005
app.use('/api/quizzes', createProxyMiddleware({
  target: process.env.QUIZ_SERVICE_URL + '/api/quizzes',
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(503).json({ message: 'Quiz service unavailable' });
    }
  }
}));

// 404 handler
// 404 handler
app.use('*splat', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🌐 API Gateway running on port ${PORT}
─────────────────────────────────────
📍 Routes:
  /api/auth         → Auth Service          (${process.env.AUTH_SERVICE_URL})
  /api/kuppi-class  → Kuppi Class Service   (${process.env.VACANCY_SERVICE_URL})
  /api/resources     → Resource Service      (${process.env.RESOURCE_SERVICE_URL})
  /api/study-groups → Study Group Service   (${process.env.STUDY_GROUP_SERVICE_URL})
  /api/quizzes      → Quiz Service          (${process.env.QUIZ_SERVICE_URL})
─────────────────────────────────────
  `);
});