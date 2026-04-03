<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Auth Service is running ✅' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT} 🚀`);
});

// optional export for tests
module.exports = app;
=======
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Auth Service is running ✅' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT} 🚀`);
});

// optional export for tests
module.exports = app;
>>>>>>> 207f7f22089cfb39d90ce84fd3169fa82339d961
