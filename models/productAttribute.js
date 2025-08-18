const { FOREIGNKEYS } = require("sequelize/lib/query-types");

module.exports = (sequelize, DataTypes) => {
    const ProductAttribute = sequelize.define('ProductAttribute', {
        name: {type:DataTypes.STRING,unique:true},
        
    });
    return ProductAttribute;
};