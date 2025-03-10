const pool = require('../config/db');

exports.checkBusinessLimit = async (req, res, next) => {
    try {
        const [business] = await pool.query(
            'SELECT * FROM businesses WHERE owner_id = ?',
            [req.user.id]
        );

        if (business.length > 0) {
            return res.status(400).json({
                message: 'Ya tienes un negocio registrado. No puedes crear más de uno.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar negocio', error: error.message });
    }
};

exports.checkBusinessOwnership = async (req, res, next) => {
    try {
        const [business] = await pool.query(
            'SELECT * FROM businesses WHERE id = ? AND owner_id = ?',
            [req.params.businessId, req.user.id]
        );

        if (!business.length) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a este negocio'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad del negocio', error: error.message });
    }
};
