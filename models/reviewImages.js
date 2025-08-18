module.exports = (sequelize, DataTypes) => {
    const ReviewImages = sequelize.define('ReviewImages', {
      url: DataTypes.STRING,
      
    });
    
    // Get images for a specific product review
    ReviewImages.getByReviewId = async function(reviewId) {
      return await this.findAll({
        where: { reviewId: reviewId }
      });
    };
    return ReviewImages;   
}