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
            {
              model: sequelize.models.ProductAttributeValue,
              include: [
                {
                  model: sequelize.models.ProductAttribute,
                }
              ]
            }
          ]
        }]
      }]
    });
  };
  
  Cart.getCartTotal = async function(cartId) {
    const { QueryTypes } = require('sequelize');
    const result = await sequelize.query(`
      SELECT SUM(
        pv.price * ci.quantity
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


