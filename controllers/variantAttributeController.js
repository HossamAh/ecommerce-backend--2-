const db = require("../models");
const { ProductAttribute } = db;

exports.create = async (req, res) => {
    try {
    const result = await ProductAttribute.create(req.body);
    res.status(201).json(result);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
    const results = await ProductAttribute.findAll();
    res.json(results);
    }
    catch (err) {
    res.status(500).json({ error: err.message });
    }
};

