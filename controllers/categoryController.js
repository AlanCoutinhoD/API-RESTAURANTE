const pool = require('../config/db');

exports.createCategory = async (req, res) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO categories (name, description, branch_id) VALUES (?, ?, ?)',
            [req.body.name, req.body.description, req.body.branch_id]
        );
        
        const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
        res.status(201).json(category[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear categoría', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        if (!category.length) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json(category[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE categories SET ? WHERE id = ?',
            [updates, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        const [updatedCategory] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        res.json(updatedCategory[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
    }
};
