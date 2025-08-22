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
    const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
    try {
        const results = await ProductAttributeValue.findAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    model: db.ProductAttribute,
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
            ],
        });
         const totalPages = Math.ceil(results.length / pageSize);
    
    res.json({
      productAttributesValues: results,
      totalPages: totalPages,
      currentPage: page,
      totalCount: results.length
    });
    } catch (err) {
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

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await ProductAttributeValue.update(req.body, {
            where: { id }
        });
        if (updated) {
            const updatedValue = await ProductAttributeValue.findByPk(id);
            return res.status(200).json(updatedValue);
        }
        throw new Error('ProductAttributeValue not found');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProductAttributeValue.destroy({
            where: { id }
        });
        if (deleted) {
            return res.status(204).send();
        }
        throw new Error('ProductAttributeValue not found');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
