module.exports = (sequelize, DataTypes) => {
  const Size = sequelize.define('Size', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING, // Size code like S, M, L, XL, etc.
      allowNull: false
    }
  });
  
  return Size;
};