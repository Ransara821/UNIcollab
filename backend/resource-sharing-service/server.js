const express = require("express");
const cors = require("cors");
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require("./config/db");
const resourceRoutes = require("./routes/resource.routes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Resource Sharing Service Running");
});

app.use('/api/resources', require('./routes/resource.routes'));

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});