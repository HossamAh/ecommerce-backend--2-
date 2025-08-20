const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');
const app = express();
app.use(cors({
  origin: [
      'http://localhost:3000',
      'https://ecommerce-app-five-jet-26.vercel.app/'], // Replace with your frontend URL
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log(process.env.MYSQL_URL);
const db = require('./models');
// Only use this in development!
// In production, use migrations instead
// if (process.env.NODE_ENV === 'development') {
//   db.sequelize.sync({ alter: true }).then(() => {
//     console.log('Database synced');
//   }).catch(err => {
//     console.error('Error syncing database:', err);
//   });
// }
// else{
  db.sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced in production');
  }).catch(err => {
    console.error('Error syncing database in production:', err);
  });
// }


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
// app.use('/api/reviews', require('./routes/reviewRoutes'));
// app.use('/api/reviewImages', require('./routes/reviewImageRoutes'));
app.use('/api/productAttributes', require('./routes/ProductAttributeRoutes'));
app.use('/api/productAttributeValues', require('./routes/ProductAttributeValueRoutes'));