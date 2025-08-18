

module.exports = (sequelize, DataTypes) => {
    const ProductAttributeValue = sequelize.define('ProductAttributeValue', {
        value: {type:DataTypes.STRING,
            unique:'compositeIndex',
            allowNull:false
        },
        code:{type:DataTypes.STRING,unique:'compositeIndex',allowNull:false},
        ProductAttributeId:{type:DataTypes.INTEGER,references:{
            model:'ProductAttributes',
            key:'id'
        },onDelete:'CASCADE',unique:'compositeIndex',allowNull:false}

    });
    return ProductAttributeValue;
};