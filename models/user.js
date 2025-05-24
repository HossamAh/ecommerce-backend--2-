module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  },
    { timestamps: true }
  );
  
  // Custom methods from userModel.js
  User.findByEmail = async function(email) {
    return await this.findOne({ where: { email } });
  };
  
  User.findByRole = async function(role) {
    return await this.findAll({ where: { role } });
  };
  
  return User;
};
