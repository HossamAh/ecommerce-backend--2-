module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING
  });
  
  // Custom methods from categoryModel.js
  Category.getWithProductCount = async function() {
    const { QueryTypes } = require('sequelize');
    return await sequelize.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM Categories c
      LEFT JOIN Products p ON c.id = p.CategoryId
      GROUP BY c.id
    `, {
      type: QueryTypes.SELECT,
      model: Category
    });
  };
  
  return Category;
};
