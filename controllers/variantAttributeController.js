const db = require("../models");
const { ProductAttribute } = db;

exports.create = async (req, res) => {
    console.log(req.body);
    try {
    const result = await ProductAttribute.create(req.body);
    res.status(201).json(result);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

exports.getAll = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    try {
    const results = await ProductAttribute.findAll({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    const totalPages = Math.ceil(results.length / pageSize);

    res.json({
      productAttributes: results,
      totalPages: totalPages,
      currentPage: page,
      totalCount: results.length
    });
    }
    catch (err) {
    res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await ProductAttribute.update(req.body, {
            where: { id }
        });
        if (updated) {
            const updatedAttribute = await ProductAttribute.findByPk(id);
            return res.status(200).json(updatedAttribute);
        }
        throw new Error('ProductAttribute not found');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProductAttribute.destroy({
            where: { id }
        });
        if (deleted) {
            return res.status(204).send();
        }
        throw new Error('ProductAttribute not found');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
