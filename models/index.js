const { Sequelize } = require('sequelize');
require('dotenv').config();
let sequelize;
if(process.env.NODE_ENV !== 'production') { 
 sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  define: {
    // This ensures that table names match model names
    freezeTableName: false,
    // This ensures that column names use camelCase in JavaScript but snake_case in the database
    underscored: false
  }
});
}
else{
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
    define: {
      // This ensures that table names match model names
      freezeTableName: false,
      // This ensures that column names use camelCase in JavaScript but snake_case in the database
      underscored: false
    }
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.ProductImage = require('./productImage')(sequelize, Sequelize);
db.Review = require('./reviews')(sequelize, Sequelize);
db.ReviewImages = require('./reviewImages')(sequelize, Sequelize);
db.ProductVariant = require('./productVariant')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.OrderItem = require('./orderItem')(sequelize, Sequelize);
db.OrderShipping = require('./orderShipping')(sequelize, Sequelize);
db.Cart = require('./cart')(sequelize, Sequelize);
db.CartItem = require('./cartItem')(sequelize, Sequelize);
db.Notification = require('./notification')(sequelize, Sequelize);
db.BlackListTokens = require('./blackListToken')(sequelize, Sequelize);
db.ProductAttribute = require('./productAttribute')(sequelize, Sequelize);
db.ProductAttributeValue = require('./productAttributeValue')(sequelize, Sequelize);

// Relations
db.Category.hasMany(db.Product,{ foreignKey: 'CategoryId' , onDelete: 'CASCADE' });
db.Product.belongsTo(db.Category, { foreignKey: 'CategoryId' });

//general images
db.Product.hasMany(db.ProductImage,{ foreignKey: 'ProductId', scope: { ProductVariantId: null }, onDelete: 'CASCADE' });
db.ProductImage.belongsTo(db.Product, { foreignKey: 'ProductId' });

// Add new relation for variant-specific images
db.ProductVariant.hasOne(db.ProductImage,{ foreignKey: 'ProductVariantId', onDelete: 'CASCADE' });
db.ProductImage.belongsTo(db.ProductVariant, { foreignKey: 'ProductVariantId' });

// New relations for product variants
db.Product.hasMany(db.ProductVariant,{ foreignKey: 'ProductId', onDelete: 'CASCADE' });
db.ProductVariant.belongsTo(db.Product, { foreignKey: 'ProductId' });

// Relation for review and reviewImages
// db.Review.belongsTo(db.User, { foreignKey: 'UserId', onDelete: 'CASCADE' });
// db.Review.belongsTo(db.Product, { foreignKey: 'ProductId', onDelete: 'CASCADE' });

// // // Relation for  reviewImages
// db.Review.hasMany(db.ReviewImages,{foreignKey:'ReviewId',onDelete:'CASCADE'});

// Relation for product attribute and product attribute value
db.ProductAttributeValue.belongsTo(db.ProductAttribute,{foreignKey:'ProductAttributeId',onDelete:'CASCADE'});
db.ProductAttribute.hasMany(db.ProductAttributeValue,{foreignKey:'ProductAttributeId',onDelete:'CASCADE'});

// junction table with product variant and attribute values
db.ProductVariant.belongsToMany(db.ProductAttributeValue,{through:'ProductVariantAttribute',foreignKey:'ProductVariantId',onDelete:'CASCADE'});
db.ProductAttributeValue.belongsToMany(db.ProductVariant,{through:'ProductVariantAttribute',foreignKey:'ProductAttributeValueId',onDelete:'CASCADE'});





db.User.hasMany(db.Order, { foreignKey: 'UserId' , onDelete: 'CASCADE' });
db.Order.belongsTo(db.User, { foreignKey: 'UserId' });

db.Order.hasMany(db.OrderItem, { foreignKey: 'OrderId' , onDelete: 'CASCADE' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'OrderId' });

db.Order.hasOne(db.OrderShipping, { foreignKey: 'OrderId' , onDelete: 'CASCADE' });
db.OrderShipping.belongsTo(db.Order, { foreignKey: 'OrderId' });

// Update OrderItem to reference ProductVariant
db.ProductVariant.hasMany(db.OrderItem, { foreignKey: 'ProductVariantId' , onDelete: 'CASCADE' });
db.OrderItem.belongsTo(db.ProductVariant, { foreignKey: 'ProductVariantId' });

db.User.hasOne(db.Cart,{ foreignKey: 'UserId' , onDelete: 'CASCADE' });
db.Cart.belongsTo(db.User, { foreignKey: 'UserId' });

db.Cart.hasMany(db.CartItem,{ foreignKey: 'CartId' , onDelete: 'CASCADE'});
db.CartItem.belongsTo(db.Cart, { foreignKey: 'CartId' });

// Update CartItem to reference ProductVariant instead of Product
db.ProductVariant.hasMany(db.CartItem,{ foreignKey: 'ProductVariantId' , onDelete: 'CASCADE'});
db.CartItem.belongsTo(db.ProductVariant, { foreignKey: 'ProductVariantId' });

db.User.hasMany(db.Notification,{ foreignKey: 'UserId' , onDelete: 'CASCADE'});
db.Notification.belongsTo(db.User, { foreignKey: 'UserId' });

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




