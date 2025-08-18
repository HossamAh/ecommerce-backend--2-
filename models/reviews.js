module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
      rate:DataTypes.INTEGER,
      review:DataTypes.TEXT,
    });
    
    // Custom methods
    Review.findByProduct = async function(productId) {
      return await this.findAll({ 
        where: { ProductId: productId },
        include: [
          sequelize.models.ReviewImages,
        ]
      });
    };
    
    return Review;
}