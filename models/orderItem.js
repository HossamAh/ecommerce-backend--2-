module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    OrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    ProductVariantId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ProductVariants',
        key: 'id'
      }
    }
  });
  
  return OrderItem;
};

