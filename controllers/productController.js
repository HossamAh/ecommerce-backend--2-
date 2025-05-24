const db = require('../models');
const { Product } = db;

exports.create = async (req, res) => {
  try {
    // If main_image_url is provided, use it
    const productData = req.body;
    
    const result = await Product.create(productData);
    
    // If main_image_url is provided and ProductImage is also provided, create the image
    if (productData.main_image_url && productData.productImages && productData.productImages.length > 0) {
      // Find or create the primary image
      const primaryImageIndex = productData.productImages.findIndex(img => img.is_primary);
      
      if (primaryImageIndex === -1) {
        // No primary image found, create one using main_image_url
        await db.ProductImage.create({
          url: productData.main_image_url,
          ProductId: result.id,
          ProductVariantId: null,
          is_primary: true
        });
      } else {
        // Update the primary image URL to match main_image_url
        productData.productImages[primaryImageIndex].url = productData.main_image_url;
      }
      
      // Create all product images
      for (const image of productData.productImages) {
        await db.ProductImage.create({
          ...image,
          ProductId: result.id
        });
      }
    }
    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  try {
    const results = await Product.getProductsWithImages(page, pageSize);
    const totalPages = Math.ceil(results.count / pageSize);
    res.json({
      products: results.rows,
      totalPages: totalPages,
      currentPage: page,
      totalCount: results.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getById = async (req, res) => {
  try {
    const result = await Product.getProductByIdwithImages(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const productData = req.body;
    
    // Update the product
    await Product.update(productData, { where: { id: req.params.id } });
    
    // If main_image_url is updated, update the primary image or create one
    if (productData.main_image_url) {
      const primaryImage = await db.ProductImage.findOne({
        where: { 
          ProductId: req.params.id,
          ProductVariantId: null,
          is_primary: true
        }
      });
      
      if (primaryImage) {
        // Update existing primary image
        await primaryImage.update({ url: productData.main_image_url });
      } else {
        // Create new primary image
        await db.ProductImage.create({
          url: productData.main_image_url,
          ProductId: req.params.id,
          ProductVariantId: null,
          is_primary: true
        });
      }
    }
    
    // Get the updated product
    const updatedProduct = await Product.getProductByIdwithImages(req.params.id);
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMainImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const mainImageUrl = await product.getMainImage();
    res.json({ mainImageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

