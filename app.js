const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://ecommerce-app-five-jet-26.vercel.app', // Your Vercel frontend URL
  'http://localhost:3000', // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and requests from allowed origins.
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Important for cookies and authentication
};

// Middleware setup - CORS should be near the top
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import database connection and models
const db = require('./models');

// Define and use routes BEFORE starting the server
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// entity routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/productImages', require('./routes/productImageRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/orderItems', require('./routes/orderItemRoutes'));
app.use('/api/carts', require('./routes/cartRoutes'));
app.use('/api/cartItems', require('./routes/cartItemRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/productAttributes', require('./routes/ProductAttributeRoutes'));
app.use('/api/productAttributeValues', require('./routes/ProductAttributeValueRoutes'));

// Database synchronization and server start
// Use an async IIFE (Immediately Invoked Function Expression)
// or move this logic to a separate startup function
(async () => {
  try {
    // Sync database based on NODE_ENV
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true }); // Use await
      console.log('Database synced in development');
    } else {
      await db.sequelize.sync(); // Use await. For production, avoid {alter:true} without migrations
      console.log('Database synced in production');
    }

    // Start server only after database sync is complete
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Log the MYSQL_URL after everything is set up
    console.log(`MYSQL_URL: ${process.env.MYSQL_URL}`);

  } catch (err) {
    console.error('Failed to start server due to database or other error:', err);
    // Exit the process if the database connection fails on startup
    process.exit(1); 
  }
})();