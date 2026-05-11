// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app = express();

/**
 * MIDDLEWARE SETUP
 */
// Parse incoming JSON requests
app.use(express.json());

// Parse cookies for JWT authentication
app.use(cookieParser());

// Enable Cross-Origin Resource Sharing (CORS) for the frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent with requests
}));

/**
 * ROUTES
 */
app.use('/api/auth', authRoutes);      // Authentication endpoints (login, signup)
app.use('/api/expenses', expenseRoutes); // Expense management endpoints (CRUD)

/**
 * DATABASE CONNECTION & SERVER START
 */
const PORT = process.env.PORT || 5000;

// Connect to MongoDB using the URI provided in environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start the server only after a successful database connection
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with failure
  });
