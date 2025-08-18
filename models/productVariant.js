module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });
  
  // Get discounted price
  ProductVariant.prototype.getDiscountedPrice = function() {
    return this.price * (1 - this.discount_percentage / 100);
  };
  
  // Get price difference from base price
  ProductVariant.prototype.getPriceDifference = async function() {
    const product = await this.getProduct();
    return this.price - product.base_price;
  };
  
  // Get variant with all related data including images
  ProductVariant.getFullVariant = async function(variantId) {
    return await this.findByPk(variantId, {
      include: [
        {
          model: sequelize.models.ProductAttributeValue,
          include: [
            {
              model: sequelize.models.ProductAttribute,
            }
          ]
        },
        {
          model: sequelize.models.ProductImage,
          where: { is_primary: true },
          required: false,
          limit: 1
        },
        {
          model: sequelize.models.Product,
          include: [{
            model: sequelize.models.ProductImage,
            where: { 
              ProductVariantId: null,
              is_primary: true 
            },
            required: false,
            limit: 1
          }]
        }
      ]
    });
  };
  
  // Get all variants for a product with their images
  ProductVariant.getByProductId = async function(productId) {
    return await this.findAll({
      where: { ProductId: productId },
      include: [
        {
          model: sequelize.models.ProductAttributeValue,
          include: [
            {
              model: sequelize.models.ProductAttribute,
            }
          ]
        },
        {
          model: sequelize.models.ProductImage,
          where: { is_primary: true },
          required: false,
          limit: 1
        }
      ]
    });
  };
  
  return ProductVariant;
};

