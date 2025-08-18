const { where } = require('sequelize');
const db = require('../models');
const {BlackListTokens} = db;

exports.create = async (req, res) => {
  try {
   // Check for Authorization header in different cases
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Log the received header for debugging
    // console.log('Auth Header:', authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization header missing or invalid',
        received: authHeader 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const checkIfBlacklisted = await BlackListTokens.findOne({where:{ token: token }}); // Check if that token is blacklisted
    // console.log(checkIfBlacklisted);
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    await BlackListTokens.create({ token: token });
    // Also clear request cookie on client
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    });
    res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
  res.end();
};
