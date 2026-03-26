const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const quizRoutes = require('./routes/quizRoutes');

// Load environment variables
dotenv.config({ path: '../../.env' }); // Adjust path based on root .env

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/quizzes', quizRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Quiz Service is healthy' });
});

const PORT = 5005; 
app.listen(PORT, () => {
  console.log(`🚀 Quiz Service running on port ${PORT}`);
});
