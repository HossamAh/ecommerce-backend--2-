module.exports = (sequelize, DataTypes) => {
  const Color = sequelize.define('Color', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING, // Hex code or color identifier
      allowNull: false
    }
  });
  
  return Color;
};