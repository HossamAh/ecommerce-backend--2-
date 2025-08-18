const { faker } = require('@faker-js/faker');
const db = require('../models');
const { where } = require('sequelize');

async function seed() {
  try {
    // Disable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sync the database schema (force sync to recreate tables)
    await db.sequelize.sync({ force: true });

    // Re-enable foreign key checks
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Seed Users
    const users = [];
    for (let i = 0; i < 10; i++) {
      users.push(await db.User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: i === 0 ? 'admin' : 'user'
      }));
    }

    // Seed Categories
    const categories = [];
    for (let i = 0; i < 5; i++) {
      categories.push(await db.Category.create({
        name: faker.commerce.department()
      }));
    }

    // Seed Colors
    const colors = [];
    const colorData = [
      { name: 'Red', code: '#FF0000' },
      { name: 'Blue', code: '#0000FF' },
      { name: 'Green', code: '#00FF00' },
      { name: 'Black', code: '#000000' },
      { name: 'White', code: '#FFFFFF' }
    ];

    // for (const color of colorData) {
    //   const newColor = await db.ProductAttributeValue.create({
    //     value: color.name,
    //     code: color.code
    //   });
    //   colors.push(newColor);
    // }

    // Seed Sizes
    const sizes = [];
    const sizeData = [
      { name: 'Small', code: 'S' },
      { name: 'Medium', code: 'M' },
      { name: 'Large', code: 'L' },
      { name: 'Extra Large', code: 'XL' }
    ];

    // for (const size of sizeData) {
    //   const newSize = await db.ProductAttributeValue.create({
    //     value: size.name,
    //     code: size.code
    //   });
    //   sizes.push(newSize);
    // }

    // Seed Product Attributes
    const productAttributes = [];
    productAttributes.push(await db.ProductAttribute.create({
      name: "color"
    }));
    productAttributes.push(await db.ProductAttribute.create({
      name: "size"
    }));
    
    // Seed Products with Variants and Variant-specific Images
    const products = [];
    for (let i = 0; i < 20; i++) {
      const category = faker.helpers.arrayElement(categories);
      const basePrice = parseFloat(faker.commerce.price({ min: 10, max: 100 }));
      
      // Generate main image URL first
      const mainImageUrl = faker.image.urlLoremFlickr({ 
        width: 640, 
        height: 480, 
        category: category.name.toLowerCase().replace(/\s+/g, ''),
        randomize: true
      });
      
      const product = await db.Product.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        CategoryId: category.id,
        has_variants: true,
        base_price: basePrice,
        discount_percentage: faker.number.int({ min: 0, max: 30 }),
        main_image_url: mainImageUrl
      });
      
      // Add general product images (not tied to variants)
      const generalKeywords = [
        product.name.split(' ')[0],
        category.name,
        'product'
      ];

      // First create the main image as a ProductImage too
      await db.ProductImage.create({
        url: mainImageUrl,
        ProductId: product.id,
        ProductVariantId: null,
        is_primary: true
      });

      // Add additional general images
      for (let j = 0; j < 2; j++) {
        const keyword = generalKeywords[j] || 'product';
        await db.ProductImage.create({
          url: faker.image.urlLoremFlickr({ 
            width: 640, 
            height: 480, 
            category: keyword.toLowerCase().replace(/\s+/g, ''),
            randomize: true
          }),
          ProductId: product.id,
          ProductVariantId: null,
          is_primary: false
        });
      }
      
      // Create variants for each product
      const variantCount = faker.number.int({ min: 1, max: 5 });
      for (let j = 0; j < variantCount; j++) {
        const color = faker.helpers.arrayElement(colorData);
        const size = faker.helpers.arrayElement(sizeData);
        
        // Calculate variant price based on base price with some variation
        const priceVariation = faker.number.float({ min: -5, max: 15, precision: 0.01 });
        const variantPrice = Math.max(basePrice + priceVariation, 1); // Ensure price is at least 1
        
        const variant = await db.ProductVariant.create({
          ProductId: product.id,
          price: variantPrice,
          stock: faker.number.int({ min: 0, max: 100 }),
          sku: `${product.id}-${color.name}-${size.name}`,

        });
        console.log("id of the attribute of color is",productAttributes[0].id);
        console.log("id of the attribute of size is",productAttributes[1].id);
        console.log(color);
        console.log(size);
        
        // Add color attribute value to this variant
        const [colorObj,ColorCreated]=await db.ProductAttributeValue.findOrCreate({
          where:{
            ProductAttributeId: productAttributes[0].id,
            value: color.name,
            code: color.code
          },
          defaults:{
          ProductAttributeId: productAttributes[0].id, // Color attribute
          value: color.name,
          code: color.code}
        });

        // Add size attribute value to this variant
        const [sizeObj, sizeCreated]  = await db.ProductAttributeValue.findOrCreate({
          where:{
            ProductAttributeId: productAttributes[1].id, // Size attribute
            value: size.name,
            code: size.code
          },
          defaults:{
          ProductAttributeId: productAttributes[1].id, // Size attribute
          value: size.name,
          code: size.code}
        });
        // adding the records of the junction table
        // if(!ColorCreated)
          await variant.addProductAttributeValue(colorObj);
        // if(!sizeCreated)
          await variant.addProductAttributeValue( sizeObj);
        
        // Add variant-specific images
        const variantKeywords = [
          color.name.toLowerCase(),
          product.name.split(' ')[0],
          category.name
        ];

        
        // Create main variant image
        const mainVariantImageUrl = faker.image.urlLoremFlickr({ 
          width: 640, 
          height: 480, 
          category: color.name.toLowerCase(),
          randomize: true
        });
        
        await db.ProductImage.create({
          url: mainVariantImageUrl,
          ProductId: product.id,
          ProductVariantId: variant.id,
          is_primary: true
        });
        
        // Add additional variant images
        for (let k = 0; k < 2; k++) {
          const keyword = variantKeywords[k] || color.value.toLowerCase();
          await db.ProductImage.create({
            url: faker.image.urlLoremFlickr({ 
              width: 640, 
              height: 480, 
              category: keyword.toLowerCase().replace(/\s+/g, ''),
              randomize: true
            }),
            ProductId: product.id,
            ProductVariantId: variant.id,
            is_primary: false
          });
        }
      }

      products.push(product);
    }

    // Seed Carts
    for (const user of users) {
      const cart = await db.Cart.create({ UserId: user.id });
      
      // Get all product variants
      const variants = await db.ProductVariant.findAll();
      
      for (let i = 0; i < 3; i++) {
        const variant = faker.helpers.arrayElement(variants);
        await db.CartItem.create({
          CartId: cart.id,
          ProductVariantId: variant.id,
          quantity: faker.number.int({ min: 1, max: 3 })
        });
      }
    }

    // Seed Orders
    for (const user of users) {
      const order = await db.Order.create({
        UserId: user.id,
        total_amount: 0, // Will calculate later
        status: faker.helpers.arrayElement(['pending', 'paid', 'shipped', 'delivered'])
      });

      // Get all product variants
      const variants = await db.ProductVariant.findAll();
      let totalAmount = 0;
      
      for (let i = 0; i < 2; i++) {
        const variant = faker.helpers.arrayElement(variants);
        const quantity = faker.number.int({ min: 1, max: 5 });
        const price = variant.price;
        
        await db.OrderItem.create({
          OrderId: order.id,
          ProductVariantId: variant.id,
          quantity: quantity,
          price: price
        });
        
        totalAmount += price * quantity;
      }
      
      // Update order total
      await order.update({ total_amount: totalAmount });
    }

    // Seed Notifications
    for (const user of users) {
      await db.Notification.create({
        UserId: user.id,
        message: faker.lorem.sentence()
      });
    }

    console.log('✅ Database seeded!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
