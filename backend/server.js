const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());


// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const aiRoutes = require('./routes/aiRoutes');
const projectRoutes = require('./routes/projectRoutes');
const fileRoutes = require('./routes/fileRoutes');
const executionRoutes = require('./routes/executionRoutes');

app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/run', executionRoutes);

// Error Handling Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});