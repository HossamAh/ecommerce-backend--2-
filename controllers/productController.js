const { where } = require("sequelize");
const db = require("../models");
const { Product } = db;

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    console.log(req.body);
    const { name, base_price, description, CategoryId,discount_percentage, variants } = req.body;

    // 1. Create the Product
    const product = await Product.create({
      name,
      base_price,
      description,
      CategoryId,
      discount_percentage,

    }, { transaction: t });

    const files = req.files || [];

    // 2. Handle Main Image
    const mainImage = files.find(f => f.fieldname === 'mainImage');
    if (mainImage) {
      await db.ProductImage.create({
        url: mainImage.path,
        ProductId: product.id,
        is_primary: true,
      }, { transaction: t });
    }

    // 3. Handle Additional Images
    const additionalImages = files.filter(f => f.fieldname === 'images');
    if (additionalImages.length > 0) {
      const imagePromises = additionalImages.map(img => {
        return db.ProductImage.create({
          url: img.path,
          ProductId: product.id,
          is_primary: false,
        }, { transaction: t });
      });
      await Promise.all(imagePromises);
    }

    // 4. Handle Variants
    if (variants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variantData = variants[i];
        
        // a. Create ProductVariant
        const productVariant = await db.ProductVariant.create({
          price: variantData.price,
          stock: variantData.stock,
          ProductId: product.id,
        }, { transaction: t });

        // b. Handle Variant Image
        const variantImage = files.find(f => f.fieldname === `variants[${i}][image]`);
        if (variantImage) {
          await db.ProductImage.create({
            url: variantImage.path,
            ProductVariantId: productVariant.id,
            is_primary: false, 
          }, { transaction: t });
        }

        // c. Handle Variant Attributes
        if (variantData.variantsAttributes) {
          const attributes = JSON.parse(variantData.variantsAttributes);
          for (const attr of attributes) {
            // attr.value is ProductAttributeValueId
            await productVariant.addProductAttributeValue(attr.value, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    const result = await Product.getProductByIdWithImages(product.id);
    res.status(201).json(result);

  } catch (err) {
    await t.rollback();
    console.error('Error creating product:', err);
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
      totalCount: results.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await Product.getProductByIdWithImages(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const productId = req.params.id;
    const productData = req.body;
    const files = req.files || [];

    // 1. Update Product details
    await Product.update(productData, { where: { id: productId }, transaction: t });

    // 2. Handle Main Image
    const mainImage = files.find(f => f.fieldname === 'mainImage');
    if (mainImage) {
      await db.ProductImage.destroy({ where: { ProductId: productId, is_primary: true }, transaction: t });
      await db.ProductImage.create({
        url: mainImage.path,
        ProductId: productId,
        is_primary: true,
      }, { transaction: t });
    }

    // 3. Handle Additional Images
    const additionalImages = files.filter(f => f.fieldname === 'images');
    if (additionalImages.length > 0) {
      const imagePromises = additionalImages.map(img => {
        return db.ProductImage.create({
          url: img.path,
          ProductId: productId,
          is_primary: false,
        }, { transaction: t });
      });
      await Promise.all(imagePromises);
    }

    // 4. Handle Variants
    if (productData.variants && productData.variants.length > 0) {
      for (let i = 0; i < productData.variants.length; i++) {
        const variantData = productData.variants[i];
        
        let productVariant;
        if (variantData.id) {
          // Update existing variant
          await db.ProductVariant.update(variantData, { where: { id: variantData.id }, transaction: t });
          productVariant = await db.ProductVariant.findByPk(variantData.id);
        } else {
          // Create new variant
          productVariant = await db.ProductVariant.create({
            ...variantData,
            ProductId: productId,
          }, { transaction: t });
        }

        // Handle variant image
        const variantImage = files.find(f => f.fieldname === `variants[${i}][image]`);
        if (variantImage) {
          await db.ProductImage.destroy({ where: { ProductVariantId: productVariant.id }, transaction: t });
          await db.ProductImage.create({
            url: variantImage.path,
            ProductVariantId: productVariant.id,
          }, { transaction: t });
        }

        // Handle variant attributes
        if (variantData.variantsAttributes) {
          const attributes = JSON.parse(variantData.variantsAttributes);
          // Remove old attributes before adding new ones
          await productVariant.setProductAttributeValues([], { transaction: t }); 
          for (const attr of attributes) {
            await productVariant.addProductAttributeValue(attr.value, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    const updatedProduct = await Product.getProductByIdWithImages(productId);
    res.json(updatedProduct);

  } catch (err) {
    await t.rollback();
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    await Product.destroy({ where: { id: req.params.id } });
    res.json(req.params.id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMainImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const mainImageUrl = await product.getMainImage();
    res.json({ mainImageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
