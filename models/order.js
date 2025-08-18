module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    status: { 
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'), 
      defaultValue: 'pending' 
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  });
  
  // Custom methods from orderModel.js
  Order.findByUserWithItems = async function(userId) {
    return await this.findAll({
      where: { UserId: userId },
      include: [{
        model: sequelize.models.OrderItem,
        include: [sequelize.models.ProductVariant, sequelize.models.OrderShipping]
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
  
  // New method to create order from cart
  Order.createFromCart = async function(userId,shippingFee, shippingInfo) {
    const transaction = await sequelize.transaction();
    
    try {
      // Get user's cart with items
      const cart = await sequelize.models.Cart.findByUserWithItems(userId);
      if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      const cartTotal = await sequelize.models.Cart.getCartTotal(cart.id);
      const totalAmount = cartTotal + shippingFee;
      
      
      // Create order
      const order = await this.create({
        UserId: userId,
        total_amount: totalAmount,
        status: 'pending'
      }, { transaction });
      
      // Create order items from cart items
      for (const cartItem of cart.CartItems) {
        const variant = cartItem.ProductVariant;
        const price = variant.discount_percentage > 0 
          ? variant.price * (1 - variant.discount_percentage / 100) 
          : variant.price;
          
        await sequelize.models.OrderItem.create({
          OrderId: order.id,
          ProductVariantId: cartItem.ProductVariantId,
          quantity: cartItem.quantity,
          price: price
        }, { transaction });
        
        // Update stock
        await variant.update({
          stock: variant.stock - cartItem.quantity
        }, { transaction });
      }
      
      // Create shipping info
      await sequelize.models.OrderShipping.create({
        ...shippingInfo,
        OrderId: order.id
      }, { transaction });
      
      // Clear cart items
      await sequelize.models.CartItem.destroy({
        where: { CartId: cart.id }
      }, { transaction });
      
      await transaction.commit();
      
      // Return order with items and shipping
      return await this.findByPk(order.id, {
        include: [
          {
            model: sequelize.models.OrderItem,
            include: [sequelize.models.ProductVariant]
          },
          sequelize.models.OrderShipping
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  
  // New method to create order for a single item
  Order.createForSingleItem = async function(userId, variantId, quantity, shippingInfo,shippingFee) {
    const transaction = await sequelize.transaction();
    
    try {
      // Get product variant
      const variant = await sequelize.models.ProductVariant.findByPk(variantId, {
        include: [sequelize.models.Product]
      });
      
      if (!variant) {
        throw new Error('Product variant not found');
      }
      
      if (variant.stock < quantity) {
        throw new Error('Not enough stock');
      }
      
      // Calculate price
      const price = variant.discount_percentage > 0 
        ? variant.price * (1 - variant.discount_percentage / 100) 
        : variant.price;
      
      const totalAmount = price * quantity+shippingFee;
      
      // Create order
      const order = await this.create({
        UserId: userId,
        total_amount: totalAmount,
        status: 'pending'
      }, { transaction });
      
      // Create order item
      await sequelize.models.OrderItem.create({
        OrderId: order.id,
        ProductVariantId: variantId,
        quantity: quantity,
        price: price
      }, { transaction });
      
      // Create shipping info
      await sequelize.models.OrderShipping.create({
        ...shippingInfo,
        OrderId: order.id
      }, { transaction });
      
      // Update stock
      await variant.update({
        stock: variant.stock - quantity
      }, { transaction });
      
      await transaction.commit();
      
      // Return order with items and shipping
      return await this.findByPk(order.id, {
        include: [
          {
            model: sequelize.models.OrderItem,
            include: [sequelize.models.ProductVariant]
          },
          sequelize.models.OrderShipping
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };
  
  return Order;
};



