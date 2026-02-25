const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/sos',           require('./routes/sosRoutes'));
app.use('/api/tasks',         require('./routes/taskRoutes'));
app.use('/api/inventory',     require('./routes/inventoryRoutes'));
app.use('/api/camps',         require('./routes/campRoutes'));
app.use('/api/distribution',  require('./routes/distributionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/incidents',     require('./routes/incidentRoutes'));
app.use('/api/analytics',     require('./routes/analyticsRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Disaster Platform API running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
