const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const dotenv   = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Study Group Service is running ✅' }));

app.use('/api/study-groups', require('./routes/studyGroupRoutes'));

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Study Group service running on port ${PORT} 🚀`));
