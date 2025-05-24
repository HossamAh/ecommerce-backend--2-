module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    // Any cart-specific fields
  });
  
  Cart.createWithUser = async function(userId) {
    return await this.create({ UserId: userId });
  };
  
  // Custom methods
  Cart.findByUserWithItems = async function(userId) {
    return await this.findOne({
      where: { UserId: userId },
      include: [{
        model: sequelize.models.CartItem,
        include: [{
          model: sequelize.models.ProductVariant,
          include: [
            sequelize.models.Product,
            sequelize.models.Color,
            sequelize.models.Size
          ]
        }]
      }]
    });
  };
  
  Cart.getCartTotal = async function(cartId) {
    const { QueryTypes } = require('sequelize');
    const result = await sequelize.query(`
      SELECT SUM(
        CASE 
          WHEN pv.discount_percentage > 0 
          THEN pv.price * (1 - pv.discount_percentage / 100) * ci.quantity
          ELSE pv.price * ci.quantity
        END
      ) as total
      FROM CartItems ci
      JOIN ProductVariants pv ON ci.ProductVariantId = pv.id
      WHERE ci.CartId = :cartId
    `, {
      replacements: { cartId },
      type: QueryTypes.SELECT
    });
    
    return result[0]?.total || 0;
  };
  
  return Cart;
};


