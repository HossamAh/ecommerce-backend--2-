const db = require('../models');
const {ProductImage} = db;

exports.create = async (req, res) => {
  try {
    const result = await ProductImage.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const results = await ProductImage.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByProduct = async (req, res) => {
  try {
    const results = await ProductImage.getByProductId(req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getByVariant = async (req, res) => {
  try {
    const results = await ProductImage.getByVariantId(req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await ProductImage.findByPk(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await ProductImage.update(req.body, { where: { id: req.params.id } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await ProductImage.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
