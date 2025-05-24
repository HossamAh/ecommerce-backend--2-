const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { User, Cart } = db;
require("dotenv").config();

exports.register = async (req, res) => {
  console.log(req.body);
  const userData = req.body;
  userData.password = await bcrypt.hash(userData.password, 10);
  console.log(userData);
  try {
    const result = await User.create(userData);
    // Create cart for this user
    await Cart.createWithUser(result.id);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    // If the user was created but cart creation failed, delete the user
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.log(err);
      res.status(500).json({ error: "An error occurred during registration" });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Authentication failed" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Wrong credentials" });
  // creating access token
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  //creating refresh token
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Set the token as an HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Set to true in production
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000, // 2 hours
  });
  res.json({ accessToken });
};

exports.profile = async (req, res) => {
  console.log(req.user);
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.refresh = async (req, res) => {
  if (req.cookies?.refreshToken) {
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.refreshToken;

    // Verifying refresh token
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Wrong Refesh Token
        return res.status(406).json({ message: "Unauthorized" });
      } else {
        // Correct token we send a new access token
        // creating access token
        const accessToken = jwt.sign(
          { id: decoded.id, role: decoded.role },
          process.env.JWT_SECRET,
          { expiresIn: "2h" }
        );

        //creating refresh token
        const refreshToken = jwt.sign(
          { id: decoded.id, role: decoded.role },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        // rotation of refresh token , generate new one after using the old one.
        // Set the token as an HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true, // Set to true in production
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        res.json({ accessToken });
      }
    });
  } else {
    return res.status(406).json({ message: "Unauthorized" });
  }
};
