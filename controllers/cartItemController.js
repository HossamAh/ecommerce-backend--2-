const db = require('../models');
const {CartItem} = db;

exports.create = async (req, res) => {
  try {
    const result = await CartItem.createWithProductVariant(req.body.cartId, req.body.variantId, req.body.quantity);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const results = await CartItem.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await CartItem.findByPk(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  // console.log(req.params);
  // console.log(req.body);
  try {
    const result = await CartItem.update(req.body, { where: { id: req.params.id , CartId: req.body.cartId } });
    // console.log(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  // console.log(req.body);
  try {
    await CartItem.destroy({ where: { id: req.body.cartItemId , CartId: req.body.CartId } });
    res.status(204).json({cartItemId: req.body.id});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};