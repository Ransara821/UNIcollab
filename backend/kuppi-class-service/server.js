const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

connectDB();

app.use(cors());
app.use(express.json());


app.use('/api/kuppi-class', require('./routes/kuppiClassRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Kuppi Class Service is running ✅' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Kuppi Class service running on port ${PORT} 🚀`);
});

// optional export for tests
module.exports = app;