const db = require('../models');
const {Cart} = db;

exports.createWithUser = async (req, res) => {
  try {
    const result = await Cart.createWithUser(req.user.id);    
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllWithItems = async (req, res) => {
  try {
    const results = await Cart.findAllWithItems();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWithItems = async (req, res) => {
  try {
    const result = await Cart.findByPkWithItems(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByUserWithItems = async (req, res) => {
  
  try {
    const result = await Cart.findByUserWithItems(req.user.id);
    const totalPrice = await Cart.getCartTotal(result.id);   
    if (!result) return res.status(404).json({ error: 'Not found' });
    const sanitizedResult = JSON.parse(JSON.stringify(result));
    res.json({...sanitizedResult, totalPrice});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};

exports.update = async (req, res) => {
  try {
    const result = await Cart.update(req.body, { where: { id: req.params.id } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Cart.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};