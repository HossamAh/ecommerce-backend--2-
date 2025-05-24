module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    url: DataTypes.STRING,
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  
  // Get images for a specific product variant
  ProductImage.getByVariantId = async function(variantId) {
    return await this.findAll({
      where: { ProductVariantId: variantId }
    });
  };
  
  // Get images for a product (general images not tied to a variant)
  ProductImage.getByProductId = async function(productId) {
    return await this.findAll({
      where: { 
        ProductId: productId,
        ProductVariantId: null
      }
    });
  };
  
  return ProductImage;
};
