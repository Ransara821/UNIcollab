const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const path     = require('path');
const dotenv   = require('dotenv');
const connectDB = require('./config/db');

// Load root .env first (shared MONGO_URI, JWT_SECRET), then local override
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static uploads (for HTML instructions)
app.use('/api/quizzes/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/subjects',     require('./routes/subjectRoutes'));
app.use('/api/quizzes',      require('./routes/quizRoutes'));
app.use('/api/quizzes/:quizId/questions', require('./routes/questionRoutes'));
app.use('/api/questions',    require('./routes/questionStandaloneRoutes'));
app.use('/api/attempts',     require('./routes/attemptRoutes'));
app.use('/api/leaderboard',  require('./routes/leaderboardRoutes'));

app.get('/health', (req, res) => res.json({ status: 'Quiz Service is healthy ✅' }));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.path} not found` }));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`🚀 Quiz Service running on port ${PORT}`));

module.exports = app;
