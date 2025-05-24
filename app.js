const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
      'http://localhost:3000',
      'https://todo-list-app-kohl-kappa.vercel.app'], // Replace with your frontend URL
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const db = require('./models');
db.sequelize.sync().then(() => {
  console.log('Database synchronized');
});


// entity routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categorys', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/productImages', require('./routes/productImageRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/orderItems', require('./routes/orderItemRoutes'));
app.use('/api/carts', require('./routes/cartRoutes'));
app.use('/api/cartItems', require('./routes/cartItemRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));