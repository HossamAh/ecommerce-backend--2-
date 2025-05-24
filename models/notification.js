module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    message: DataTypes.TEXT,
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};