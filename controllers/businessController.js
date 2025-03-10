const pool = require('../config/db');

exports.createBusiness = async (req, res) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO businesses (name, description, owner_id) VALUES (?, ?, ?)',
            [req.body.name, req.body.description, req.user.id]
        );
        
        const [business] = await pool.query('SELECT * FROM businesses WHERE id = ?', [result.insertId]);
        res.status(201).json(business[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear negocio', error: error.message });
    }
};

exports.getBusinesses = async (req, res) => {
    try {
        const [businesses] = await pool.query(
            'SELECT * FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener negocios', error: error.message });
    }
};

exports.getBusiness = async (req, res) => {
    try {
        const [business] = await pool.query(
            'SELECT * FROM businesses WHERE id = ? AND owner_id = ?',
            [req.params.businessId, req.user.id]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        res.json(business[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener negocio', error: error.message });
    }
};

exports.updateBusiness = async (req, res) => {
    try {
        const updates = req.body;
        const [result] = await pool.query(
            'UPDATE businesses SET ? WHERE id = ? AND owner_id = ?',
            [updates, req.params.businessId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        const [updatedBusiness] = await pool.query(
            'SELECT * FROM businesses WHERE id = ? AND owner_id = ?',
            [req.params.businessId, req.user.id]
        );

        res.json(updatedBusiness[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar negocio', error: error.message });
    }
};

exports.deleteBusiness = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM businesses WHERE id = ? AND owner_id = ?',
            [req.params.businessId, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        res.status(204).json({ message: 'Negocio eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar negocio', error: error.message });
    }
};
