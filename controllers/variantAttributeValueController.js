const db = require("../models");
const { ProductAttributeValue } = db;

exports.create = async (req, res) => {
    try {
    const result = await ProductAttributeValue.create(req.body);
    res.status(201).json(result);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

exports.getAll = async (req, res) => {
    try {
    const results = await ProductAttributeValue.findAll();
    res.json(results);
    }
    catch (err) {
    res.status(500).json({ error: err.message });
    }
};

exports.getAllByAttribute = async (req, res) => {
    try {
        const results = await ProductAttributeValue.findAll({
         where: {
            ProductAttributeId: req.params.id,
        },
        });
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllByVariant = async (req, res) => {
    try {
        const results = await db.ProductVariant.getProductAttributeValues();
        res.json(results);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};