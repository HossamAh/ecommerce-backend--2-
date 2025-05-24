module.exports = (sequelize, DataTypes) => {
  const BlackListTokens = sequelize.define('BlackListTokens', {
    token: DataTypes.STRING
  });
  return BlackListTokens;
}