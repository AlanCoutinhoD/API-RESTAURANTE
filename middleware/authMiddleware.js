const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.protect = async (req, res, next) => {
    try {
        // Obtener token de la cabecera Authorization
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'No autorizado para acceder a este recurso' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtener usuario
        const [user] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user.length) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Set user with consistent ID field
        req.user = {
            ...user[0],
            id: decoded.userId
        };
        next();
    } catch (error) {
        res.status(401).json({ message: 'No autorizado para acceder a este recurso' });
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `No tienes permisos para realizar esta acción. Roles permitidos: ${roles.join(', ')}`
            });
        }
        next();
    };
};

exports.isOwner = async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const [business] = await pool.query(
            'SELECT * FROM businesses WHERE id = ?',
            [businessId]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        if (business[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'No eres el propietario de este negocio' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'No autorizado para acceder a este recurso' });
    }
};

exports.isBranchStaff = async (req, res, next) => {
    try {
        const { branchId } = req.params;
        const [branch] = await pool.query(
            'SELECT * FROM branches WHERE id = ?',
            [branchId]
        );

        if (!branch.length) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        const [business] = await pool.query(
            'SELECT * FROM businesses WHERE id = ?',
            [branch[0].business_id]
        );

        if (!business.length) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        if (business[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'No tienes permisos para acceder a esta sucursal' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'No autorizado para acceder a este recurso' });
    }
};
