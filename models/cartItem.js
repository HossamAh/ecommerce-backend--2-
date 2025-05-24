
module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    quantity: DataTypes.INTEGER
  });
  
  CartItem.createWithProductVariant = async function(cartId, variantId, quantity) {
    const variant = await sequelize.models.ProductVariant.findByPk(variantId, {
      include: [sequelize.models.Product]
    });
    
    // Check if this variant is already in the cart
    const cartItem = await this.findOne({ 
      where: { 
        CartId: cartId, 
        ProductVariantId: variantId 
      } 
    });
    
    if (cartItem) {
      await cartItem.update({ quantity: cartItem.quantity + quantity });
      return { 
        cartItem, 
        price: variant.price * quantity 
      };
    }
    
    const newCartItem = await this.create({ 
      CartId: cartId, 
      ProductVariantId: variantId, 
      quantity 
    });
    
    return { 
      cartItem: newCartItem, 
      price: variant.price * quantity 
    };
  };
  
  return CartItem;
};

