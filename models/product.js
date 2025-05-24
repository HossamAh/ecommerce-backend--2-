module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    base_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    has_variants: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    main_image_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });
  
  // Custom methods
  Product.findByCategory = async function(categoryId) {
    return await this.findAll({ 
      where: { CategoryId: categoryId },
      include: [
        sequelize.models.ProductImage,
        {
          model: sequelize.models.ProductVariant,
          include: [
            sequelize.models.Color,
            sequelize.models.Size
          ]
        }
      ]
    });
  };
  
  Product.getTopSelling = async function(limit = 10) {
    const { QueryTypes } = require('sequelize');
    return await sequelize.query(`
      SELECT p.*, COUNT(oi.id) as sales_count 
      FROM Products p
      JOIN ProductVariants pv ON p.id = pv.ProductId
      JOIN OrderItems oi ON pv.id = oi.ProductVariantId
      GROUP BY p.id
      ORDER BY sales_count DESC
      LIMIT :limit
    `, {
      replacements: { limit },
      type: QueryTypes.SELECT,
      model: Product
    });
  };
  
  Product.getProductsWithImages = async function(page = 1, pageSize = 10) {
    // First get the total count of products (without variants affecting the count)
    const totalCount = await this.count();
    
    // Then get the paginated products with their images and variants
    const products = await this.findAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: sequelize.models.ProductImage,
          where: { ProductVariantId: null }, // Only general product images
          required: false
        },
        {
          model: sequelize.models.ProductVariant,
          include: [
            sequelize.models.Color,
            sequelize.models.Size,
            sequelize.models.ProductImage // Include variant-specific images
          ],
          required: false
        }
      ],
      order: [['id', 'ASC']]
    });
    
    return {
      count: totalCount,
      rows: products
    };
  };

  Product.getProductByIdwithImages = async function(productID){
    return await this.findByPk(productID, {
      include: [
        {
          model: sequelize.models.ProductImage,
          where: { ProductVariantId: null }, // Only general product images
          required: false
        },
        {
          model: sequelize.models.ProductVariant,
          include: [
            sequelize.models.Color,
            sequelize.models.Size,
            sequelize.models.ProductImage // Include variant-specific images
          ]
        }
      ]
    });
  };
  
  Product.prototype.getMainImage = async function() {
    // First try to get the main_image_url
    if (this.main_image_url) {
      return this.main_image_url;
    }
    
    // If not available, try to get the primary image
    const primaryImage = await sequelize.models.ProductImage.findOne({
      where: {
        ProductId: this.id,
        ProductVariantId: null,
        is_primary: true
      }
    });
    
    if (primaryImage) {
      return primaryImage.url;
    }
    
    // If no primary image, get the first image
    const firstImage = await sequelize.models.ProductImage.findOne({
      where: {
        ProductId: this.id,
        ProductVariantId: null
      }
    });
    
    return firstImage ? firstImage.url : null;
  };
  
  return Product;
};






