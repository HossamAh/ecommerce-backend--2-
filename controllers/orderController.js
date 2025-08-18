const db = require('../models');
const { Order } = db;

exports.create = async (req, res) => {
  try {
    const result = await Order.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const results = await Order.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await Order.findByPk(req.params.id, {
      include: [
        {
          model: db.OrderItem,
          include: [{
            model: db.ProductVariant,
            include: [db.Product, db.Color, db.Size]
          }]
        },
        db.OrderShipping
      ]
    });
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await Order.update(req.body, { where: { id: req.params.id } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New methods for creating orders
exports.createFromCart = async (req, res) => {
  try {
    const { shippingInfo,shippingFee } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware
    
    const result = await Order.createFromCart(userId,shippingFee, shippingInfo);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createForSingleItem = async (req, res) => {
  try {
    const { variantId, quantity, shippingInfo,shippingFee } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware
    
    const result = await Order.createForSingleItem(userId, variantId, quantity, shippingInfo,shippingFee);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware
    const orders = await Order.findByUserWithItems(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
