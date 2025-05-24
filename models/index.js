const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.ProductImage = require('./productImage')(sequelize, Sequelize);
db.Color = require('./color')(sequelize, Sequelize);
db.Size = require('./size')(sequelize, Sequelize);
db.ProductVariant = require('./productVariant')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.OrderItem = require('./orderItem')(sequelize, Sequelize);
db.Cart = require('./cart')(sequelize, Sequelize);
db.CartItem = require('./cartItem')(sequelize, Sequelize);
db.Notification = require('./notification')(sequelize, Sequelize);
db.BlackListTokens = require('./blackListToken')(sequelize, Sequelize);

// Relations
db.Category.hasMany(db.Product);
db.Product.belongsTo(db.Category);

//general images
db.Product.hasMany(db.ProductImage);
db.ProductImage.belongsTo(db.Product);

// Add new relation for variant-specific images
db.ProductVariant.hasMany(db.ProductImage);
db.ProductImage.belongsTo(db.ProductVariant);

// New relations for product variants
db.Product.hasMany(db.ProductVariant);
db.ProductVariant.belongsTo(db.Product);

db.Color.hasMany(db.ProductVariant);
db.ProductVariant.belongsTo(db.Color);

db.Size.hasMany(db.ProductVariant);
db.ProductVariant.belongsTo(db.Size);

db.User.hasMany(db.Order);
db.Order.belongsTo(db.User);

db.Order.hasMany(db.OrderItem);
db.OrderItem.belongsTo(db.Order);

// Update OrderItem to reference ProductVariant instead of Product
db.ProductVariant.hasMany(db.OrderItem);
db.OrderItem.belongsTo(db.ProductVariant);

db.User.hasOne(db.Cart);
db.Cart.belongsTo(db.User);

db.Cart.hasMany(db.CartItem);
db.CartItem.belongsTo(db.Cart);

// Update CartItem to reference ProductVariant instead of Product
db.ProductVariant.hasMany(db.CartItem);
db.CartItem.belongsTo(db.ProductVariant);

db.User.hasMany(db.Notification);
db.Notification.belongsTo(db.User);

// Add complex queries that span multiple models
db.queries = {
  getDashboardStats: async function() {
    const { QueryTypes } = require('sequelize');
    return await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM Users) as total_users,
        (SELECT COUNT(*) FROM Products) as total_products,
        (SELECT COUNT(*) FROM Orders) as total_orders,
        (SELECT SUM(total_amount) FROM Orders WHERE status = 'delivered') as total_revenue
    `, {
      type: QueryTypes.SELECT
    });
  }
};

module.exports = db;


