const pool = require('../config/db');

exports.checkBranchOwnership = async (req, res, next) => {
    try {
        const [branch] = await pool.query(
            'SELECT b.*, bu.owner_id as business_owner_id \
            FROM branches b \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE b.id = ?',
            [req.params.branchId]
        );

        if (!branch.length) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        if (branch[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a esta sucursal'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad de la sucursal', error: error.message });
    }
};

exports.checkBranchBusinessOwnership = async (req, res, next) => {
    try {
        const [branch] = await pool.query(
            'SELECT b.*, bu.owner_id as business_owner_id \
            FROM branches b \
            LEFT JOIN businesses bu ON b.business_id = bu.id \
            WHERE b.business_id = ?',
            [req.params.businessId]
        );

        if (!branch.length) {
            return res.status(404).json({ message: 'No hay sucursales para este negocio' });
        }

        if (branch[0].business_owner_id !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permisos para acceder a las sucursales de este negocio'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error al verificar propiedad del negocio', error: error.message });
    }
};
