const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Study Group Service is running ✅' });
});

app.get('/api/study-groups', (req, res) => {
  res.json({ message: 'Study Groups list (placeholder)', groups: [] });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Study Group service running on port ${PORT} 🚀`);
});
