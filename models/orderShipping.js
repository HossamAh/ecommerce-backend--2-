module.exports = (sequelize, DataTypes) => {
  const OrderShipping = sequelize.define('OrderShipping', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    landmark: DataTypes.STRING,
    OrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Orders',
        key: 'id'
      }
    }
  });
  
  // Validate shipping info
  OrderShipping.validateShippingInfo = function(shippingInfo) {
    const requiredFields = ['name', 'address', 'city', 'phone', 'email'];
    for (const field of requiredFields) {
      if (!shippingInfo[field]) {
        throw new Error(`${field} is required for shipping`);
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      throw new Error('Invalid email format');
    }
    
    return true;
  };
  
  return OrderShipping;
};
