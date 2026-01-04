const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

console.log('ENV FILE LOADED?', !!process.env.PORT);
console.log('STRIPE KEY PRESENT?', !!process.env.STRIPE_SECRET_KEY);
console.log('FIRST 6 CHARS:', process.env.STRIPE_SECRET_KEY?.slice(0, 6));
console.log('RUNNING FROM:', process.cwd());

const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
