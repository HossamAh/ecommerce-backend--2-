const db = require('../models');
const {Notification} = db;

exports.create = async (req, res) => {
  try {
    const result = await Notification.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const results = await Notification.findAll();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await Notification.findByPk(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await Notification.update(req.body, { where: { id: req.params.id } });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};