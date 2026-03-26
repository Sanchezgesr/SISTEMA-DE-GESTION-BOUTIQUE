const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // Aumentado para desarrollo y evitar fallos por 429 "Too Many Requests"
});
app.use('/api/', limiter);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Import Routes
const routes = require('./routes');
const errorHandler = require('./middleware/error');

// Routes
app.use('/api', routes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Boutique API', version: '1.0.0' });
});

// Test Route with DB Check
const pool = require('./db');
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', message: 'Boutique API is fully functional' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Backend] Server is running on port ${PORT}`);
});
