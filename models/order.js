module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    status: { 
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'), 
      defaultValue: 'pending' 
    },
    total_amount: DataTypes.FLOAT
  });
  
  // Custom methods from orderModel.js
  Order.findByUserWithItems = async function(userId) {
    return await this.findAll({
      where: { UserId: userId },
      include: [{
        model: sequelize.models.OrderItem,
        include: [sequelize.models.Product]
      }],
      order: [['createdAt', 'DESC']]
    });
  };
  
  Order.getOrderStats = async function() {
    const { QueryTypes } = require('sequelize');
    return await sequelize.query(`
      SELECT 
        status, 
        COUNT(*) as count, 
        SUM(total_amount) as revenue
      FROM Orders
      GROUP BY status
    `, {
      type: QueryTypes.SELECT
    });
  };
  
  return Order;
};
